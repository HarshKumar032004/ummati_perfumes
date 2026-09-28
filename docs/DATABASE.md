# DATABASE.md — Ummati Perfumes
## Production Mongoose Schemas, Indexing Strategy & Data Conventions

> All prices stored as **integers in paise** (₹1 = 100 paise) to eliminate floating-point bugs.  
> All Order items are **snapshots** — they never join back to the Product collection, preserving historical accuracy.

---

## Pricing Convention

```typescript
// ALWAYS store in paise (integer)
// ₹1,250.00 → stored as 125000
// ₹0.00    → stored as 0

// Conversion utilities (lib/price.ts)
const toPaise = (rupees: number): number => Math.round(rupees * 100);
const toRupees = (paise: number): number => paise / 100;
const formatPrice = (paise: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
```

---

## 1. User Model

```typescript
// types/user.types.ts
export interface IAddress {
  _id: string;
  label: string;           // "Home" | "Work" | custom
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;         // "IN"
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  phone: string;           // E.164 format: +919876543210
  email?: string;
  name?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  role: 'customer' | 'admin';
  savedAddresses: IAddress[];
  wishlist: string[];      // Product _id references
  totalOrders: number;     // Denormalized counter
  totalSpend: number;      // Denormalized, in paise
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// models/User.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

const AddressSchema = new Schema<IAddress>({
  label:     { type: String, default: 'Home' },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  line1:     { type: String, required: true },
  line2:     { type: String },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true, match: /^[1-9][0-9]{5}$/ },
  country:   { type: String, default: 'IN' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>({
  phone:           { type: String, required: true, unique: true },
  email:           { type: String, sparse: true, lowercase: true },
  name:            { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  role:            { type: String, enum: ['customer', 'admin'], default: 'customer' },
  savedAddresses:  { type: [AddressSchema], default: [] },
  wishlist:        [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  totalOrders:     { type: Number, default: 0 },
  totalSpend:      { type: Number, default: 0 },  // paise
  isActive:        { type: Boolean, default: true },
  lastLoginAt:     { type: Date },
}, { timestamps: true });

// Indexes
UserSchema.index({ phone: 1 });                         // Primary lookup
UserSchema.index({ email: 1 }, { sparse: true });       // Optional email lookup
UserSchema.index({ role: 1 });                          // Admin queries
UserSchema.index({ createdAt: -1 });                    // Customer list sorted by newest
```

---

## 2. Product Model

```typescript
// types/product.types.ts
export type FragranceFamily =
  | 'Oriental' | 'Floral' | 'Woody' | 'Fresh'
  | 'Citrus' | 'Fougere' | 'Chypre' | 'Gourmand' | 'Aquatic';

export type Longevity = '2-3 hours' | '4-6 hours' | '6-8 hours' | '8+ hours';
export type Sillage = 'Intimate' | 'Moderate' | 'Strong' | 'Enormous';
export type InventoryPolicy = 'deny' | 'continue';   // deny = block purchase when OOS

export interface IProductVariant {
  _id: string;
  label: string;          // "30ml" | "50ml" | "100ml"
  sku: string;            // "UMM-OUD-R-50ML" — globally unique
  price: number;          // paise — overrides product base price
  compareAtPrice?: number; // paise
  stock: number;           // integer units available
  isDefault: boolean;
}

export interface IProductImage {
  url: string;            // Cloudinary URL
  publicId: string;       // Cloudinary public_id (for deletion)
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  sortOrder: number;
}

export interface IProduct {
  _id: string;
  slug: string;           // URL-safe, unique: "oud-royale-50ml"
  name: string;
  shortDescription: string;
  description: string;    // Rich text (stored as HTML or MDX)

  // Pricing (base — overridden by variant)
  basePrice: number;      // paise
  compareAtPrice?: number; // paise

  // Fragrance profile
  fragranceFamily: FragranceFamily;
  topNotes: string[];     // ["Bergamot", "Saffron", "Pink Pepper"]
  middleNotes: string[];  // ["Rose", "Oud", "Jasmine"]
  baseNotes: string[];    // ["Sandalwood", "Amber", "Musk"]
  longevity: Longevity;
  sillage: Sillage;
  ingredients?: string;   // Full INCI list

  // Variants (sizes)
  variants: IProductVariant[];

  // Inventory
  inventoryPolicy: InventoryPolicy;
  trackInventory: boolean;

  // Media
  images: IProductImage[];

  // Catalog
  categories: string[];   // ["women", "floral", "gift-sets"]
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;

  // Aggregated stats (updated by background jobs or review submission)
  reviewCount: number;
  averageRating: number;  // 0.0 – 5.0, stored as float for display only

  createdAt: Date;
  updatedAt: Date;
}

// models/Product.model.ts
const ProductVariantSchema = new Schema<IProductVariant>({
  label:          { type: String, required: true },
  sku:            { type: String, required: true },
  price:          { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  stock:          { type: Number, required: true, min: 0, default: 0 },
  isDefault:      { type: Boolean, default: false },
});

const ProductImageSchema = new Schema<IProductImage>({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  alt:       { type: String, required: true },
  width:     { type: Number, required: true },
  height:    { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>({
  slug:             { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  description:      { type: String, required: true },
  basePrice:        { type: Number, required: true, min: 0 },
  compareAtPrice:   { type: Number, min: 0 },
  fragranceFamily:  { type: String, required: true, enum: ['Oriental','Floral','Woody','Fresh','Citrus','Fougere','Chypre','Gourmand','Aquatic'] },
  topNotes:         [{ type: String }],
  middleNotes:      [{ type: String }],
  baseNotes:        [{ type: String }],
  longevity:        { type: String, enum: ['2-3 hours','4-6 hours','6-8 hours','8+ hours'] },
  sillage:          { type: String, enum: ['Intimate','Moderate','Strong','Enormous'] },
  ingredients:      { type: String },
  variants:         { type: [ProductVariantSchema], required: true },
  inventoryPolicy:  { type: String, enum: ['deny','continue'], default: 'deny' },
  trackInventory:   { type: Boolean, default: true },
  images:           { type: [ProductImageSchema], default: [] },
  categories:       [{ type: String }],
  tags:             [{ type: String }],
  isActive:         { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  isNewArrival:     { type: Boolean, default: false },
  isBestSeller:     { type: Boolean, default: false },
  metaTitle:        { type: String },
  metaDescription:  { type: String },
  reviewCount:      { type: Number, default: 0 },
  averageRating:    { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

// Indexes
ProductSchema.index({ slug: 1 });                          // Product page lookup
ProductSchema.index({ isActive: 1, categories: 1 });       // Collection browsing
ProductSchema.index({ isActive: 1, isFeatured: 1 });       // Homepage featured
ProductSchema.index({ isActive: 1, isBestSeller: 1 });     // Best sellers
ProductSchema.index({ isActive: 1, isNewArrival: 1 });     // New arrivals
ProductSchema.index({ isActive: 1, basePrice: 1 });        // Price sort + filter
ProductSchema.index({ isActive: 1, averageRating: -1 });   // Rating sort
ProductSchema.index({ 'variants.sku': 1 });                // SKU lookup for inventory
ProductSchema.index(                                       // Full-text search
  { name: 'text', shortDescription: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, shortDescription: 1 } }
);
```

---

## 3. Order Model

> **Critical**: Order items are **immutable snapshots** at the time of purchase.  
> Never reference Product collection from Order items — price changes must not affect order history.

```typescript
// types/order.types.ts
export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type OrderStatus =
  | 'placed'       // Initial state for both COD and online
  | 'confirmed'    // Admin confirmed (especially for COD)
  | 'processing'   // Being packed
  | 'shipped'      // AWB assigned, in transit
  | 'delivered'    // Confirmed delivered
  | 'cancelled'    // Cancelled (before dispatch)
  | 'return_requested'
  | 'returned';

export interface IOrderItem {
  productId: string;        // ObjectId ref — for future analytics only, NOT for price
  productName: string;      // Snapshot
  productSlug: string;      // Snapshot — for order confirmation page links
  variantLabel: string;     // "50ml" — snapshot
  sku: string;              // Snapshot
  image: string;            // Cloudinary URL snapshot
  quantity: number;
  unitPrice: number;        // paise — SERVER-VALIDATED price at order time
  totalPrice: number;       // paise — unitPrice * quantity
}

export interface IShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrderAuditLog {
  timestamp: Date;
  action: string;           // "status_changed" | "payment_received" | "tracking_added"
  performedBy: string;      // "system" | "admin:{adminId}" | "webhook"
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

export interface IOrder {
  _id: string;
  orderNumber: string;      // "UMM-2024-00001"

  // Customer identity
  userId?: string;          // Null for guest orders
  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress: IShippingAddress;
  items: IOrderItem[];

  // Pricing breakdown (all paise)
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  couponCode?: string;
  couponId?: string;        // Ref to Coupon document
  total: number;            // subtotal + shippingCharge - discountAmount

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;      // rzp_order_...
  razorpayPaymentId?: string;    // pay_...
  razorpaySignature?: string;    // HMAC stored for audit — DO NOT expose to client
  paidAt?: Date;

  // Fulfillment
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;

  // Internal
  adminNotes?: string;
  auditLog: IOrderAuditLog[];

  createdAt: Date;
  updatedAt: Date;
}

// models/Order.model.ts
const OrderItemSchema = new Schema<IOrderItem>({
  productId:    { type: Schema.Types.ObjectId, ref: 'Product' },
  productName:  { type: String, required: true },
  productSlug:  { type: String, required: true },
  variantLabel: { type: String, required: true },
  sku:          { type: String, required: true },
  image:        { type: String, required: true },
  quantity:     { type: Number, required: true, min: 1 },
  unitPrice:    { type: Number, required: true, min: 0 },
  totalPrice:   { type: Number, required: true, min: 0 },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber:      { type: String, required: true, unique: true },
  userId:           { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  customer:         {
    name:  { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  shippingAddress:  { /* inline schema */ },
  items:            { type: [OrderItemSchema], required: true },
  subtotal:         { type: Number, required: true, min: 0 },
  shippingCharge:   { type: Number, required: true, min: 0 },
  discountAmount:   { type: Number, default: 0, min: 0 },
  couponCode:       { type: String },
  couponId:         { type: Schema.Types.ObjectId, ref: 'Coupon', sparse: true },
  total:            { type: Number, required: true, min: 0 },
  paymentMethod:    { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentStatus:    { type: String, enum: ['pending','paid','failed','refunded','partially_refunded'], default: 'pending' },
  razorpayOrderId:  { type: String, sparse: true },
  razorpayPaymentId:{ type: String, sparse: true },
  razorpaySignature:{ type: String, select: false },   // Never returned in queries by default
  paidAt:           { type: Date },
  status:           { type: String, enum: ['placed','confirmed','processing','shipped','delivered','cancelled','return_requested','returned'], default: 'placed' },
  trackingNumber:   { type: String },
  trackingUrl:      { type: String },
  courierName:      { type: String },
  estimatedDelivery:{ type: Date },
  deliveredAt:      { type: Date },
  adminNotes:       { type: String },
  auditLog:         [{ timestamp: Date, action: String, performedBy: String, previousValue: String, newValue: String }],
}, { timestamps: true });

// Indexes
OrderSchema.index({ orderNumber: 1 });                        // Order lookup (public)
OrderSchema.index({ userId: 1, createdAt: -1 });              // User order history
OrderSchema.index({ razorpayOrderId: 1 }, { sparse: true });  // Webhook lookup — UNIQUE enforces idempotency
OrderSchema.index({ status: 1, createdAt: -1 });              // Admin order filtering
OrderSchema.index({ paymentStatus: 1 });                      // Payment reconciliation
OrderSchema.index({ 'customer.phone': 1 });                   // Customer lookup
OrderSchema.index({ 'customer.email': 1 });                   // Customer lookup
OrderSchema.index({ createdAt: -1 });                         // Admin: all orders sorted newest
```

---

## 4. Review Model

```typescript
export interface IReview {
  _id: string;
  productId: string;
  orderId?: string;           // If linked to verified purchase
  userId?: string;
  customer: {
    name: string;
    email: string;
  };
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  images?: string[];          // Cloudinary URLs
  isVerifiedPurchase: boolean;
  isApproved: boolean;        // Admin approval gate
  helpfulCount: number;
  createdAt: Date;
}

// Indexes
ReviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 }); // Product reviews
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ isApproved: 1, createdAt: -1 });                // Admin review moderation
```

---

## 5. Coupon Model

```typescript
export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface ICoupon {
  _id: string;
  code: string;               // "WELCOME10" — uppercase, unique
  type: CouponType;
  value: number;              // Percentage (0-100) or paise amount
  minOrderValue?: number;     // paise — minimum cart value to apply
  maxDiscount?: number;       // paise — cap for percentage discounts
  usageLimit?: number;        // Total times this coupon can be used
  usageCount: number;         // Current usage count
  perUserLimit?: number;      // Max uses per user
  applicableCategories?: string[]; // If empty, applies to all
  applicableProducts?: string[];   // Specific product ObjectIds
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// Indexes
CouponSchema.index({ code: 1 });               // Coupon lookup at checkout
CouponSchema.index({ isActive: 1, endDate: 1 }); // Active coupons
```

---

## 6. Category Model

```typescript
export interface ICategory {
  _id: string;
  slug: string;               // "women-perfumes"
  name: string;               // "Women's Perfumes"
  description?: string;
  image?: string;             // Cloudinary URL
  parentCategory?: string;    // For subcategories
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}
```

---

## 7. Indexing Summary

| Collection | Key Indexes | Purpose |
|---|---|---|
| User | `phone`, `email (sparse)`, `role` | Auth lookup, admin queries |
| Product | `slug`, `isActive+categories`, `isActive+price`, `text (name+tags)`, `variants.sku` | Product page, browsing, search, inventory |
| Order | `orderNumber`, `razorpayOrderId (unique sparse)`, `userId+createdAt`, `status+createdAt` | Lookup, idempotency, history, admin |
| Review | `productId+isApproved+createdAt`, `isApproved+createdAt` | Product page reviews, admin moderation |
| Coupon | `code`, `isActive+endDate` | Checkout lookup |

---

## 8. Mongoose Transactions

Use `session.withTransaction()` for atomic operations:

### Checkout — Inventory Decrement + Order Creation
```typescript
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // 1. Re-validate stock in same transaction
  const product = await Product.findOneAndUpdate(
    { 'variants.sku': sku, 'variants.stock': { $gte: quantity } },
    { $inc: { 'variants.$.stock': -quantity } },
    { session, new: true }
  );
  if (!product) throw new Error('INSUFFICIENT_STOCK');

  // 2. Create order atomically
  await Order.create([orderData], { session });

  // 3. Increment coupon usage if applicable
  if (couponId) {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } }, { session });
  }
});
await session.endSession();
```
