# SYSTEM_FLOWS.md — Ummati Perfumes
## Complex System Flows, Edge Cases & Concurrency Handling

---

## 1. Concurrency & Inventory — Pessimistic Locking Flow

### Problem
Two users simultaneously add the last item (stock: 1) to cart and both reach checkout.
Without locking, both orders succeed and stock goes to -1 (overselling).

### Solution: Redis Pessimistic Lock + Mongoose Atomic Decrement

```
USER A                              USER B                    REDIS / DB
──────                              ──────                    ──────────
Click "Place Order"
  │
  ├─► initiateCheckout()
  │   ├─► Validate stock (DB: 1)    Click "Place Order"
  │   │                               │
  │   ├─► SET lock:inv:SKU-X         ├─► initiateCheckout()
  │   │   NX EX 600 ──────────────► REDIS: lock SET ✓
  │   │                               │
  │   │                               ├─► Validate stock (DB: 1)
  │   │                               ├─► SET lock:inv:SKU-X
  │   │                               │   NX EX 600 ──────────► REDIS: NX fails (key exists)
  │   │                               │
  │   │                               └─► Return INVENTORY_LOCKED error
  │   │                                   "Someone else is checking out this item.
  │   │                                    Please wait or choose another."
  │   │
  │   ├─► Create Razorpay order
  │   └─► Return { razorpayOrderId, ... }
  │
  ├─► User completes payment
  │
  ├─► verifyRazorpayPayment()
  │   ├─► HMAC verify signature ✓
  │   ├─► Mongoose Transaction:
  │   │   ├─► findOneAndUpdate SKU-X:
  │   │   │   { stock: { $gte: 1 } } → { $inc: { stock: -1 } }
  │   │   │   (atomic — fails if stock < 1 — final safety net)
  │   │   └─► Create Order document
  │   └─► DEL lock:inv:SKU-X ──────► REDIS: lock released
  │
  └─► Redirect to /order/UMM-2024-00001

```

### Lock Expiry Scenarios
```
Scenario A: User abandons checkout after lock (closes tab)
  → Lock expires after 10 minutes (TTL)
  → Other users can now checkout

Scenario B: Payment takes >10 minutes (very unlikely with UPI)
  → Lock expires; stock technically "available" in Redis
  → Mongoose atomic $gte check at transaction time prevents overselling
  → Order creation fails; user shown payment-received-but-order-failed page
  → Razorpay refund initiated via admin

Scenario C: Server crashes during checkout
  → Lock expires after 10 minutes (TTL-based, self-healing)
  → Razorpay webhook retries → idempotency check finds no order → creates it
```

---

## 2. Razorpay Webhook — Idempotent Payment Processing

### Problem
Razorpay may fire the same `payment.captured` webhook multiple times (network retries, their retry policy). Without idempotency, each webhook creates a duplicate order.

### Solution: Unique Index + Early Return Pattern

```
RAZORPAY                 OUR WEBHOOK HANDLER              MONGODB
────────                 ──────────────────               ───────
payment.captured (1st)
  │
  ├──────────────────► POST /api/webhooks/razorpay
  │                      │
  │                      ├─► Verify X-Razorpay-Signature ✓
  │                      │
  │                      ├─► Extract razorpayOrderId: "order_ABC123"
  │                      │
  │                      ├─► Order.findOne({ razorpayOrderId: "order_ABC123" })
  │                      │   └─► Result: null (not found)
  │                      │
  │                      ├─► Retrieve checkout session from Redis
  │                      ├─► Mongoose transaction:
  │                      │   ├─► Decrement stock
  │                      │   └─► Order.create({ razorpayOrderId: "order_ABC123", ... })
  │                      │       ← unique index on razorpayOrderId
  │                      │
  │                      ├─► Send order confirmation
  │                      └─► HTTP 200 ─────────────────────────────────────► ✓
  │
  │ (30 seconds later — network issue caused Razorpay to not receive 200)
  │
payment.captured (2nd retry)
  │
  ├──────────────────► POST /api/webhooks/razorpay
  │                      │
  │                      ├─► Verify signature ✓
  │                      │
  │                      ├─► Order.findOne({ razorpayOrderId: "order_ABC123" })
  │                      │   └─► Result: { _id: ..., orderNumber: "UMM-2024-00001" }
  │                      │         (already exists!)
  │                      │
  │                      └─► HTTP 200 immediately (no duplicate processing)
  │
  └─► Razorpay: retry sequence ends ✓
```

### Why respond 200 on both?
Razorpay considers any non-2xx response as a failure and retries aggressively.
Always return 200 quickly. If there's a processing error, log it internally and handle manually.
**Never** return 500 from the webhook endpoint.

---

## 3. OTP Authentication Flow — Passwordless Login

### Full Flow Diagram

```
BROWSER                    SERVER (Route Handler)          MSG91         REDIS
───────                    ──────────────────────          ─────         ─────

User enters +91 9876543210
Click "Send OTP"
  │
  ├──► POST /api/auth/send-otp
  │    { phone: "+919876543210" }
  │                              │
  │                              ├─► Rate limit check:
  │                              │   GET ratelimit:otp:+919876543210
  │                              │   → count < 5? proceed : RATE_LIMITED
  │                              │
  │                              ├─► Generate OTP: 847291
  │                              ├─► Hash: bcrypt(847291, 8)
  │                              │
  │                              ├─► SET otp:+919876543210        ──────► TTL: 600s
  │                              │   {hash} EX 600
  │                              │
  │                              ├─► MSG91.sendOTP(phone, otp) ──────────────►
  │                              │                                            SMS sent
  │                              └─► HTTP 200 { expiresIn: 600 }
  │
User receives SMS: "Your Ummati OTP is 847291"
User enters: 847291
Click "Verify"
  │
  ├──► POST /api/auth/verify-otp
  │    { phone: "+919876543210", otp: "847291" }
  │                              │
  │                              ├─► GET otp:+919876543210 ────────────────► {hash}
  │                              │
  │                              ├─► bcrypt.compare("847291", hash) → true
  │                              │
  │                              ├─► DEL otp:+919876543210 (consume OTP)
  │                              │
  │                              ├─► User.findOrCreate({ phone }) → user doc
  │                              ├─► Set isPhoneVerified: true
  │                              │
  │                              ├─► Sign JWT:
  │                              │   { userId, role: 'customer', phone }
  │                              │   Expiry: 7 days
  │                              │
  │                              ├─► Set-Cookie: user_session=JWT
  │                              │   HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
  │                              │
  │                              ├─► Merge guest cart into user cart (Redis)
  │                              │   GET cart:guest:{guestId} → merge → SET cart:user:{userId}
  │                              │
  │                              └─► HTTP 200 { user: { name, phone, ... } }
  │
Browser: stores nothing sensitive (cookie is httpOnly)
Redirect to account page or checkout
```

### JWT Payload
```typescript
interface JWTPayload {
  userId: string;
  role: 'customer' | 'admin';
  phone: string;
  iat: number;  // issued at
  exp: number;  // expiry
}
```

### Session Validation (middleware.ts)
```typescript
// Edge Runtime — runs on every request to /account/* and /admin/*
import { jwtVerify } from 'jose';

const token = request.cookies.get('user_session')?.value;
if (!token) return NextResponse.redirect('/login');

const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
// Attach userId to request headers for downstream use
```

---

## 4. Full Purchase Flow — UPI/Razorpay (Happy Path)

```
1. User browses → Product page
2. Selects size → Click "Add to Cart"
   └─► addToCart() Server Action
       → Validates stock from DB (server)
       → Stores CartItem in Redis with SERVER price

3. User views cart → sees correct prices
   └─► getCart() fetches fresh prices from DB (re-validates)

4. User proceeds to checkout
   └─► CheckoutForm: name, phone, email, address, pincode

5. User selects "Pay Online" → clicks "Place Order"
   └─► initiateCheckout() Server Action
       → [VALIDATE] Re-fetch all prices from DB
       → [VALIDATE] Verify stock
       → [LOCK] SET Redis inventory locks
       → [RAZORPAY] Create Razorpay order server-side
       → Returns { razorpayOrderId, razorpayKeyId, amount }

6. Browser: Razorpay checkout modal opens
   └─► User authenticates with UPI/card
   └─► On success: Razorpay calls client success handler
       with { razorpayOrderId, razorpayPaymentId, razorpaySignature }

7. Client calls verifyRazorpayPayment() Server Action
   └─► HMAC signature verification
   └─► Mongoose transaction: decrement stock + create Order
   └─► Release Redis locks
   └─► Send confirmation email + SMS (async)
   └─► Returns { orderNumber: "UMM-2024-00001" }

8. Browser redirects → /order/UMM-2024-00001
   └─► SSR page: order confirmation with all details

9. (Parallel) Razorpay webhook arrives
   └─► Signature verified ✓
   └─► Order.findOne({ razorpayOrderId }) → found → 200 (no duplicate)
```

---

## 5. Payment Failure Recovery Flow

```
...Step 6 from above: User payment fails in Razorpay modal...

Razorpay fires payment.failed webhook
  └─► /api/webhooks/razorpay
      → event: payment.failed
      → Release Redis inventory locks for razorpayOrderId
      → No Order document created
      → Return 200

Client Razorpay error handler fires:
  └─► Show error toast: "Payment failed. Please try again."
  └─► Show retry options:
      - "Try Again" → reopens Razorpay modal with SAME razorpayOrderId
      - "Pay by Cash on Delivery" → initiates COD flow
      - "Cancel" → releases client state, user stays on checkout

If user retries with same razorpayOrderId:
  └─► Razorpay handles retry internally (same order can have multiple payment attempts)
  └─► If successful: webhook fires payment.captured → order created normally

Note: Inventory locks expire after 10 minutes if user abandons entirely.
```

---

## 6. Admin: Update Order Status Flow

```
Admin Dashboard → Orders List → Click Order #UMM-2024-00001

Admin selects: Status → "Shipped"
Enters tracking: "4567890123", Courier: "Delhivery"
Clicks "Update"
  │
  └─► updateOrderStatus() Server Action
      ├─► Verify admin JWT from cookie
      ├─► Find order by ID
      ├─► Validate transition: confirmed → processing → shipped ✓
      │   (placed → shipped would be INVALID — must go through confirmed, processing)
      ├─► Mongoose update:
      │   { status: 'shipped', trackingNumber, courierName, auditLog: [...new entry] }
      ├─► Non-blocking:
      │   ├─► Resend email: "Your Ummati order has shipped! Track: {url}"
      │   └─► MSG91 SMS: "Order shipped. Track: {url}"
      └─► Return updated order

Legal Status Transitions:
  placed ──────────────► confirmed
  confirmed ───────────► processing
  processing ──────────► shipped
  shipped ─────────────► delivered
  placed/confirmed/processing ─► cancelled
  delivered ───────────► return_requested
  return_requested ────► returned
```

---

## 7. Guest Cart → Authenticated Cart Merge

```
Session Start (no account):
  ├─► Generate guestId: UUID v4
  ├─► Set non-httpOnly cookie: guest_id = {uuid}
  └─► Cart stored: cart:guest:{uuid} in Redis

User adds items as guest
  └─► cart:guest:{uuid} = [{ sku: 'SKU-X', qty: 2 }, { sku: 'SKU-Y', qty: 1 }]

User logs in (verifyOTP success):
  ├─► Retrieve cart:guest:{guestId} from Redis
  ├─► Retrieve cart:user:{userId} from Redis (may have items from previous session)
  ├─► Merge strategy:
  │   - Guest items not in user cart: add to user cart
  │   - Guest items already in user cart: keep HIGHER quantity (capped at stock)
  │   - Re-validate all prices from DB
  ├─► SET cart:user:{userId} = merged cart
  └─► DEL cart:guest:{guestId}

Result: Seamless transition — user's cart preserved across sessions
```
