# API_AND_ACTIONS.md — Ummati Perfumes
## Server Actions, Route Handlers & API Design

> **Rule**: Browser → Server = Server Action.  External service → Server = Route Handler.
> All Server Actions use Zod validation before any DB/Redis operation.
> All prices are validated server-side; never trust client-provided prices.

---

## Conventions

### Response Envelope (Route Handlers)
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }

// Error codes
"VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" |
"INSUFFICIENT_STOCK" | "PAYMENT_FAILED" | "COUPON_INVALID" |
"RATE_LIMITED" | "INTERNAL_ERROR"
```

### Server Action Response Pattern
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## AUTH ACTIONS (`actions/auth.actions.ts`)

### sendOTP
```typescript
// Triggers MSG91 OTP to phone number
// Rate limited: 5 OTPs per phone per minute (Redis sliding window)
// OTP stored in Redis with 10-minute TTL: otp:{phone} → hashed OTP

Input: { phone: string }  // E.164: "+919876543210"
Zod:   phone must match /^\+91[6-9]\d{9}$/

Flow:
  1. Rate limit check (Upstash ratelimit)
  2. Generate 6-digit OTP
  3. Hash OTP with bcrypt (cost: 8)
  4. SET otp:{phone} {hashedOTP} EX 600  (Redis)
  5. Call MSG91 Send OTP API
  6. Return success (never return OTP in response)

Output: { success: true, data: { expiresIn: 600 } }
Errors: RATE_LIMITED, VALIDATION_ERROR
```

### verifyOTP
```typescript
// Verifies OTP, creates or finds User, issues JWT session cookie

Input: { phone: string, otp: string }
Zod:   phone valid, otp is 6 digits

Flow:
  1. GET otp:{phone} from Redis
  2. If null → OTP expired error
  3. bcrypt.compare(input, stored) → if false, increment fail count
  4. After 5 fails: lock phone for 15 minutes
  5. On success: DEL otp:{phone}
  6. findOrCreate User by phone (set isPhoneVerified: true)
  7. Sign JWT: { userId, role, phone }
  8. Set httpOnly cookie: user_session = JWT (7 day expiry)
  9. Merge guest cart into user cart (Redis)

Output: { success: true, data: { user: UserPublic } }
Errors: VALIDATION_ERROR, OTP_EXPIRED, OTP_INVALID, ACCOUNT_LOCKED
```

### logout
```typescript
Flow:
  1. Clear user_session cookie
  2. Return success

Output: { success: true }
```

---

## CART ACTIONS (`actions/cart.actions.ts`)

> Cart stored in Redis. Key: `cart:user:{userId}` or `cart:guest:{guestId}`.
> Guest ID is a UUID stored in a non-httpOnly cookie (accessible to JS for initialization).

### addToCart
```typescript
Input: { sku: string, quantity: number }
Zod:   sku non-empty string, quantity 1-10 integer

Flow:
  1. Fetch product variant by SKU from MongoDB (or Redis cache)
  2. Validate: product isActive, variant exists
  3. Stock check: if trackInventory && stock < quantity → INSUFFICIENT_STOCK
  4. GET current cart from Redis
  5. If SKU already in cart: update quantity (capped at stock or 10)
  6. Else: append new CartItem with server-fetched price (never client price)
  7. SET updated cart in Redis with TTL refresh
  8. Return updated cart

Output: { success: true, data: { cart: CartItem[], itemCount: number } }
Errors: NOT_FOUND, INSUFFICIENT_STOCK, VALIDATION_ERROR
```

### updateQuantity
```typescript
Input: { sku: string, quantity: number }  // quantity: 0 = remove item

Flow:
  1. GET cart from Redis
  2. Find item by SKU
  3. If quantity === 0: remove item from array
  4. If quantity > 0: validate stock, update quantity
  5. SET updated cart
  6. Return updated cart

Output: { success: true, data: { cart: CartItem[] } }
```

### getCart
```typescript
// Server Component can call this directly (no client round-trip)
// Called on cart page and checkout page

Flow:
  1. GET cart from Redis
  2. Fetch fresh prices + stock for all SKUs from MongoDB
  3. Update prices in cart (server always wins)
  4. Flag any items that are now out-of-stock
  5. Return enriched cart with current prices

Output: { cart: EnrichedCartItem[], subtotal: number, itemCount: number }
```

### applyCoupon
```typescript
Input: { code: string }
Zod:   code 3-20 chars, alphanumeric + hyphens

Flow:
  1. GET cart from Redis to get subtotal
  2. Find coupon by code (case-insensitive) in MongoDB
  3. Validate: isActive, not expired, usageLimit not exceeded
  4. Validate: minOrderValue met
  5. If perUserLimit: check user's past coupon usage
  6. Calculate discount amount
  7. Store applied coupon in cart Redis object
  8. Return discount details

Output: { success: true, data: { discount: number, finalTotal: number, message: string } }
Errors: COUPON_INVALID, COUPON_EXPIRED, COUPON_LIMIT_EXCEEDED, MIN_VALUE_NOT_MET
```

---

## CHECKOUT ACTIONS (`actions/checkout.actions.ts`)

### initiateCheckout
```typescript
// Called when user clicks "Place Order" — BEFORE showing payment UI
// This is the most critical server action

Input: {
  items: { sku: string, quantity: number }[],  // From client cart (used only as intent)
  shippingAddress: ShippingAddressInput,
  couponCode?: string,
  paymentMethod: 'razorpay' | 'cod',
  customerInfo: { name: string, email: string, phone: string }
}

Flow:
  1. [VALIDATE] Zod schema validation on all inputs
  2. [VALIDATE] Re-fetch all product+variant data from MongoDB (client prices IGNORED)
  3. [VALIDATE] For each item: check isActive, check stock ≥ quantity
  4. [VALIDATE] Recalculate subtotal from DB prices (client total IGNORED)
  5. [VALIDATE] Apply coupon if provided (server-side validation)
  6. [VALIDATE] Calculate shipping charge from config/rules
  7. [LOCK] For each SKU: SET lock:inventory:{sku} NX EX 600 (Redis)
     → If any lock fails (already locked by another user): INVENTORY_LOCKED error
  8. [RAZORPAY] If paymentMethod === 'razorpay':
     → Create Razorpay order via SDK: { amount: totalPaise, currency: 'INR', receipt: uuid }
     → Return { razorpayOrderId, razorpayKeyId, amount, orderPreview }
  9. [COD] If paymentMethod === 'cod':
     → Call createCODOrder (see below)
     → Return { orderNumber, redirectUrl: '/order/{orderNumber}' }

Output (razorpay): { success: true, data: { razorpayOrderId, razorpayKeyId, amount, orderPreview } }
Output (cod):      { success: true, data: { orderNumber } }
Errors: VALIDATION_ERROR, INSUFFICIENT_STOCK, INVENTORY_LOCKED, COUPON_INVALID
```

### verifyRazorpayPayment
```typescript
// Called after Razorpay client callback (NOT the webhook — webhook is source of truth)
// This creates the order record after signature verification

Input: {
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  checkoutSessionId: string   // UUID generated during initiateCheckout, stored in Redis
}

Flow:
  1. Retrieve checkout session from Redis (GET checkout:session:{sessionId})
     → Contains: items, prices, totals, address, coupon — server-generated, trusted
  2. Verify signature:
     HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET)
     → Must match razorpaySignature
  3. If invalid: log attempt, release inventory locks, return PAYMENT_INVALID
  4. If valid: call createOrderFromSession()
     → Mongoose transaction: decrement stock + create Order
     → Increment coupon usage if applicable
     → Release Redis inventory locks
     → DELETE checkout session from Redis
  5. Return orderNumber for redirect

Note: Webhook also handles this — idempotency via unique razorpayOrderId index prevents duplicates.

Output: { success: true, data: { orderNumber } }
Errors: PAYMENT_INVALID, SESSION_EXPIRED, INSUFFICIENT_STOCK (race condition)
```

### createCODOrder
```typescript
// Internal — called by initiateCheckout for COD

Flow:
  1. Generate orderNumber (UMM-YYYY-NNNNN, atomic MongoDB counter)
  2. Mongoose transaction:
     → Decrement stock for each SKU
     → Create Order document (paymentStatus: 'pending', status: 'placed')
  3. Release Redis inventory locks
  4. Send order confirmation email (Resend) — non-blocking
  5. Send order confirmation SMS (MSG91) — non-blocking

Output: { orderNumber: string }
```

---

## PRODUCT ACTIONS (`actions/product.actions.ts`)

### getProducts
```typescript
// Used in Shop page Server Component and admin product list

Input: {
  category?: string,
  fragranceFamily?: string,
  minPrice?: number,          // rupees (converted to paise internally)
  maxPrice?: number,
  sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating',
  search?: string,
  page?: number,
  limit?: number,             // default 20, max 50
  isAdmin?: boolean           // If true, includes inactive products
}

Flow:
  1. Build Redis cache key from sorted query params hash
  2. GET from Redis cache
  3. If cache hit: return cached data
  4. Build MongoDB query with filters
  5. Execute with pagination (skip + limit)
  6. SET Redis cache with 5-minute TTL
  7. Return products + pagination metadata

Output: { products: ProductSummary[], total: number, page: number, totalPages: number }
```

### getProductBySlug
```typescript
Input: { slug: string }

Flow:
  1. Redis cache: GET product:slug:{slug}
  2. If miss: MongoDB findOne({ slug, isActive: true })
  3. Cache with 30-minute TTL
  4. Return full product with all variants

Output: { product: IProduct } | null
```

### submitReview
```typescript
// Requires authentication

Input: {
  productId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  title: string,
  body: string,
  images?: File[]
}

Flow:
  1. Verify user is authenticated
  2. Check if user has purchased this product (join Order.items.productId)
  3. Check user hasn't already reviewed this product
  4. Upload images to Cloudinary if provided
  5. Create Review document (isApproved: false — admin moderation)
  6. Return pending approval message

Output: { success: true, data: { message: "Review submitted for approval" } }
```

---

## ADMIN ACTIONS (`actions/admin.actions.ts`)

> All admin actions verify admin JWT from httpOnly cookie before executing.

### createProduct / updateProduct
```typescript
Input: Full product form data (see Product schema)

Flow (create):
  1. Validate admin auth
  2. Zod validation on all product fields
  3. Upload images to Cloudinary (via server-side SDK)
  4. Generate slug from name (unique check + suffix if collision)
  5. Create Product document
  6. Invalidate Redis product list cache
  7. Call revalidatePath('/shop')

Flow (update):
  1-3. Same as create
  4. findByIdAndUpdate
  5. Invalidate Redis caches: product:slug:{slug}, product list patterns
  6. Call revalidatePath('/product/[slug]'), revalidatePath('/shop')

Output: { success: true, data: { product: IProduct } }
```

### updateOrderStatus
```typescript
Input: { orderId: string, status: OrderStatus, trackingNumber?: string, trackingUrl?: string }

Flow:
  1. Validate admin auth
  2. Find order, validate status transition is legal
  3. Update status + append to auditLog
  4. If status === 'shipped' and trackingNumber provided: add tracking fields
  5. Send shipping notification SMS/email — non-blocking
  6. Return updated order

Legal transitions:
  placed → confirmed → processing → shipped → delivered
  placed | confirmed | processing → cancelled
  delivered → return_requested → returned
```

### getAnalytics
```typescript
Input: { period: 'today' | '7d' | '30d' | '90d' }

Aggregations (MongoDB):
  - Total revenue (sum of Order.total where paymentStatus: 'paid')
  - Order count by status
  - Top selling products (by quantity sold)
  - Revenue by category
  - New customers vs returning
  - Average order value

Output: Streaming JSON for large aggregations
```

---

## ROUTE HANDLERS

### POST /api/webhooks/razorpay
```typescript
// CRITICAL: This is the source of truth for payment status

Auth: Verify X-Razorpay-Signature header
      HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET) must match

Flow:
  1. Parse webhook event
  2. Verify signature (raw body — NOT parsed JSON)
  3. If event === 'payment.captured':
     a. Extract razorpayOrderId from event
     b. Check if Order with razorpayOrderId already exists (idempotency)
        → If exists: return 200 (already processed, do nothing)
        → If not: retrieve checkout session from Redis
     c. Verify payment amount matches expected amount (prevent partial payments)
     d. Call createOrderFromSession() inside Mongoose transaction
     e. Release Redis inventory locks
     f. Send confirmation communications
  4. If event === 'payment.failed':
     a. Release inventory locks
     b. Update any pending checkout session state

Response: Always return 200 quickly (Razorpay retries on non-200)
          Process async if needed — respond first, then process

Idempotency: razorpayOrderId has unique index on Order model
             Duplicate webhooks → findOne returns existing order → early 200 return
```

### POST /api/auth/send-otp
```typescript
Method:       POST
Rate limit:   5 requests per 60s per IP + per phone (Upstash)
Body:         { phone: string }
Response:     { success: true, data: { expiresIn: 600 } }
```

### POST /api/auth/verify-otp
```typescript
Method:       POST
Rate limit:   10 attempts per 15 minutes per phone
Body:         { phone: string, otp: string }
Response:     Sets httpOnly cookie + { success: true, data: { user: UserPublic } }
```
