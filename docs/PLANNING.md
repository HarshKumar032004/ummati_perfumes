# PLANNING.md — Ummati Perfumes
## Production Architecture & Technical Strategy

> **Status**: Phase 0 — Foundation  
> **Version**: 1.0  
> **Last Updated**: 2026-09-28

---

## 1. Project Overview

### Brand
**Ummati Perfumes** is a premium D2C fragrance brand targeting the Indian market. This is a **full production release** — not an MVP — built to handle real traffic, concurrent checkout events, secure Indian payment flows, and comprehensive administrative operations from day one.

### Business Requirements
- Sell perfumes online with UPI, card/netbanking (Razorpay), and Cash on Delivery
- Handle inventory accurately under concurrent load (zero overselling)
- Provide a premium, sensory-first shopping experience
- Offer comprehensive admin controls for catalog, orders, customers, and analytics
- Support passwordless OTP-based authentication for customers
- Send transactional emails and SMS for order lifecycle events
- Operate with production-grade observability and error tracking

### Performance Targets
| Metric | Target |
|---|---|
| Lighthouse Performance (Desktop) | > 92 |
| Lighthouse Performance (Mobile) | > 82 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| TTFB (cached pages) | < 200ms |
| Checkout page load | < 1.5s |
| Concurrent checkout users | 200+ without overselling |

---

## 2. Enterprise Tech Stack

### Frontend
| Technology | Version | Role | Rationale |
|---|---|---|---|
| **Next.js** | 14+ (App Router) | Full-stack framework | SSR/SSG/ISR/Server Actions in one. Best SEO + DX for e-commerce |
| **TypeScript** | 5+ | Type safety | Strict mode. End-to-end types across components, API, and DB models |
| **Tailwind CSS** | 3.4+ | Styling | Utility-first, PurgeCSS in production, design token system |
| **shadcn/ui** | Latest | Base UI components | Unstyled, accessible Radix UI primitives — only what's needed |
| **Framer Motion** | 11+ | Animation | Declarative React animations; prefers-reduced-motion support built in |
| **React Three Fiber** | 8+ | 3D rendering | Hero section perfume bottle only. Lazy-loaded, WebGL fallback |
| **Drei** | 9+ | R3F helpers | useGLTF, Environment, Float, PresentationControls |
| **Zustand** | 4+ | Client state | Cart state, UI state. Persisted to localStorage for guest cart |
| **Zod** | 3+ | Validation | Schema validation for forms and Server Action inputs |

### Backend & Infrastructure
| Technology | Role | Rationale |
|---|---|---|
| **Next.js Route Handlers** | API layer (external callers) | Webhooks, OTP endpoints with rate limiting middleware |
| **Server Actions** | Mutations (browser callers) | Cart, checkout, auth — built-in CSRF, no manual endpoints needed |
| **MongoDB** (Atlas M10+) | Primary database | Flexible schema for perfume attributes; Atlas Search for full-text |
| **Mongoose** | ODM | Schema validation, middleware hooks, TypeScript support |
| **Redis** (Upstash) | Cache + inventory locks | Product cache (TTL 5m), cart sessions (TTL 72h), pessimistic checkout locks |
| **Razorpay** | Payments | UPI, card, netbanking, COD, webhooks, signature verification |
| **Resend** | Transactional email | Order confirmation, shipping updates |
| **MSG91** | SMS/OTP | Primary OTP delivery for passwordless auth |
| **Cloudinary** | Image CDN | Product images — auto WebP, responsive srcset, lazy loading |
| **Sentry** | Observability | Frontend + backend error capture, performance tracing |
| **Vercel** | Deployment | Zero-config Next.js, Edge Middleware, ISR, Analytics |

---

## 3. Architecture Decisions

### 3.1 Server Actions vs Route Handlers

| Operation | Approach | Reason |
|---|---|---|
| Add/update cart | **Server Action** | Mutation via Redis. Built-in CSRF. No manual endpoint |
| Apply coupon | **Server Action** | Server-validates against DB, no client trust |
| Initiate checkout | **Server Action** | Triggers Redis inventory lock + Razorpay order creation |
| Razorpay webhook | **Route Handler** `/api/webhooks/razorpay` | External caller — must be a real HTTP endpoint |
| OTP send/verify | **Route Handler** `/api/auth/*` | Rate limiting middleware on HTTP layer |
| Product listing (SSR) | **Server Component** | Direct DB call in component — no API overhead |
| Admin analytics | **Route Handler** | Streaming aggregation responses |

**Rule**: Browser calls browser → Server Action. External service calls → Route Handler.

### 3.2 ISR Strategy

| Page | Strategy | Revalidation | Reason |
|---|---|---|---|
| `/` (Homepage) | ISR | 1 hour | Featured products change infrequently |
| `/shop` | SSR | — | Filter/sort URL params; must always be fresh |
| `/product/[slug]` | ISR + on-demand | 30 min | `revalidatePath` called when admin updates product |
| `/order/[orderNumber]` | SSR | — | Real-time order status; cannot be stale |
| `/admin/*` | CSR | — | Auth-gated, no SEO needed |
| `/about`, `/faq`, policy pages | SSG | Never | Content static |

**On-demand revalidation**: Admin product update Server Action calls `revalidatePath('/product/[slug]')` and `revalidatePath('/shop')`.

### 3.3 Redis Architecture

#### Cart Persistence
```
Key pattern:  cart:user:{userId}           (authenticated)
              cart:guest:{guestId}         (UUID in cookie)
Value:        JSON — CartItem[]
TTL:          72 hours (extended on each mutation)
On login:     Merge guest cart → user cart → DELETE guest key
```

#### Product Catalog Cache
```
Key pattern:  products:list:{sha256(queryParams)}
Value:        JSON — ProductSummary[]
TTL:          5 minutes
Invalidation: DEL pattern on admin product CRUD
```

#### Inventory Lock (Checkout Window)
```
Key pattern:  lock:inventory:{sku}
Value:        JSON — { userId, quantity, lockId, expiresAt }
TTL:          10 minutes (checkout window)
SET behavior: SET ... NX EX 600  (atomic, fails if already locked)
Release:      DEL key after order creation OR payment failure
```
See SYSTEM_FLOWS.md for full pessimistic locking flow.

#### Rate Limiting (OTP)
```
Package:      @upstash/ratelimit
Key pattern:  ratelimit:otp:{phone}
Algorithm:    Sliding window
Limit:        5 requests per 60 seconds per phone number
```

### 3.4 Why MongoDB + Redis (not PostgreSQL)?
- Perfume products have variable, nested attributes (fragrance notes, longevity, sillage differ per product)
- Atlas Search provides full-text without separate Elasticsearch
- Redis compensates for MongoDB's weaker consistency with pessimistic locking
- Mongoose transactions (`session.withTransaction`) used for critical inventory decrement + order creation atomicity

**Trade-off acknowledged**: If the catalog grows to 10,000+ SKUs with complex relational reporting, a PostgreSQL migration would be considered. For D2C scale, MongoDB + Redis is the correct choice.

---

## 4. Complete Folder Structure

```
/home/harsh/ummati_perfumes/
├── app/
│   ├── (store)/                        # Customer-facing route group
│   │   ├── layout.tsx                  # Store shell: Navbar, Footer, AnnouncementBar
│   │   ├── page.tsx                    # Homepage
│   │   ├── shop/page.tsx               # Collection/product listing
│   │   ├── product/[slug]/page.tsx     # Product detail (ISR)
│   │   ├── cart/page.tsx               # Full cart page
│   │   ├── checkout/page.tsx           # Checkout form + payment
│   │   ├── order/[orderNumber]/page.tsx # Order confirmation + status (SSR)
│   │   ├── account/
│   │   │   ├── layout.tsx              # Auth guard
│   │   │   ├── page.tsx                # Account dashboard
│   │   │   ├── orders/page.tsx
│   │   │   └── addresses/page.tsx
│   │   └── [...legal]/page.tsx         # about, faq, policies (MDX)
│   │
│   ├── (admin)/                        # Admin route group
│   │   ├── layout.tsx                  # Auth guard + admin sidebar
│   │   └── admin/
│   │       ├── page.tsx                # Dashboard + analytics
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── customers/page.tsx
│   │       ├── coupons/
│   │       │   ├── page.tsx
│   │       │   └── new/page.tsx
│   │       ├── inventory/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── api/                            # Route Handlers (external callers only)
│   │   ├── webhooks/razorpay/route.ts  # Payment webhook
│   │   ├── auth/
│   │   │   ├── send-otp/route.ts
│   │   │   └── verify-otp/route.ts
│   │   └── admin/analytics/route.ts   # Streaming aggregations
│   │
│   ├── layout.tsx                      # Root layout
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── actions/                            # All Server Actions
│   ├── auth.actions.ts
│   ├── cart.actions.ts
│   ├── checkout.actions.ts
│   ├── product.actions.ts
│   └── admin.actions.ts
│
├── components/
│   ├── ui/                             # shadcn/ui generated
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   └── AnnouncementBar.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── HeroBottle3D.tsx            # React Three Fiber (lazy)
│   │   ├── FeaturedProducts.tsx
│   │   ├── CollectionsGrid.tsx
│   │   ├── BrandStory.tsx
│   │   ├── FragranceNoteSection.tsx
│   │   ├── Testimonials.tsx
│   │   └── WhyUmmati.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── FragranceProfile.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── QuantitySelector.tsx
│   │   └── AddToCartButton.tsx
│   ├── shop/
│   │   ├── FilterSidebar.tsx
│   │   ├── FilterDrawer.tsx
│   │   ├── SortSelect.tsx
│   │   └── SearchBar.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── AddressForm.tsx
│   │   ├── PaymentSelector.tsx
│   │   └── OrderSummary.tsx
│   ├── admin/
│   │   ├── ProductForm.tsx
│   │   ├── OrderTable.tsx
│   │   ├── StatsCard.tsx
│   │   └── InventoryManager.tsx
│   └── shared/
│       ├── PremiumButton.tsx
│       ├── RatingStars.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       ├── OptimizedImage.tsx          # Cloudinary URL builder + next/image
│       └── StructuredData.tsx          # JSON-LD injector
│
├── lib/
│   ├── db.ts                           # MongoDB singleton
│   ├── redis.ts                        # Upstash Redis client
│   ├── razorpay.ts                     # Razorpay SDK init
│   ├── cloudinary.ts
│   ├── resend.ts
│   ├── msg91.ts
│   ├── auth.ts                         # JWT sign/verify
│   ├── inventory.ts                    # Redis lock helpers
│   ├── price.ts                        # Paise/₹ math, discount calculations
│   ├── order-number.ts                 # UMM-YYYY-NNNNN generator
│   └── validations/
│       ├── checkout.schema.ts          # Zod
│       ├── product.schema.ts
│       └── coupon.schema.ts
│
├── models/
│   ├── User.model.ts
│   ├── Product.model.ts
│   ├── Order.model.ts
│   ├── Review.model.ts
│   ├── Coupon.model.ts
│   └── Category.model.ts
│
├── store/
│   ├── cart.store.ts                   # Zustand, localStorage persisted
│   └── ui.store.ts
│
├── hooks/
│   ├── useCart.ts
│   ├── useMediaQuery.ts
│   └── useWebGL.ts                     # WebGL support detection for 3D fallback
│
├── types/
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── cart.types.ts
│   └── user.types.ts
│
├── config/
│   ├── site.ts                         # Site name, URL, OG image
│   ├── shipping.ts                     # Shipping charge rules
│   └── categories.ts                   # Static category definitions
│
├── middleware.ts                        # Edge: auth guards, security headers
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── sentry.client.config.ts
├── sentry.server.config.ts
├── .env.local                           # NEVER commit
├── .env.example                         # Commit this
└── package.json
```

---

## 5. Middleware Strategy

`middleware.ts` (Edge Runtime) handles:

1. **Admin protection**: Validates `admin_token` httpOnly cookie → redirect `/admin/login` if invalid
2. **Account protection**: Validates `user_session` httpOnly cookie → redirect `/login` if unauthenticated
3. **Security headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
4. **CSP header**: Content Security Policy blocking inline scripts (except Next.js nonce)

Rate limiting is handled **inside Route Handlers** using `@upstash/ratelimit` (not middleware) to avoid Edge runtime payload size limits.

---

## 6. Key Security Principles

1. **Server-side price validation**: At checkout, prices are **always re-fetched from MongoDB** — client cart prices are for display only and are never trusted
2. **Server-side stock validation**: Available stock is verified against DB (and Redis lock count) at checkout initiation
3. **Webhook as source of truth**: Order status changes only on verified Razorpay webhook — not on client-side payment success callback
4. **HMAC-SHA256 webhook verification**: Every incoming Razorpay webhook verifies `razorpay-signature` header before processing
5. **Idempotent order creation**: `razorpayOrderId` is a unique index on Order — duplicate webhooks cannot create duplicate orders
6. **JWT in httpOnly cookies**: Auth tokens never accessible from JavaScript
7. **Zod validation on all Server Actions**: Input validated before any DB operation
8. **MongoDB injection prevention**: Mongoose with TypeScript schemas prevents injection. Never use `$where` or raw user input in queries
