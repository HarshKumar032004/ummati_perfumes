/**
 * Global TypeScript type definitions for Ummati Perfumes
 * Shared across all layers: components, server actions, API routes, models
 */

// ─── Fragrance Domain Types ──────────────────────────────────────────────────

export type FragranceFamily =
  | 'Oriental'
  | 'Floral'
  | 'Woody'
  | 'Fresh'
  | 'Citrus'
  | 'Fougere'
  | 'Chypre'
  | 'Gourmand'
  | 'Aquatic';

export type Longevity =
  | '2-3 hours'
  | '4-6 hours'
  | '6-8 hours'
  | '8+ hours';

export type Sillage = 'Intimate' | 'Moderate' | 'Strong' | 'Enormous';

export type InventoryPolicy = 'deny' | 'continue';

// ─── Product Types ───────────────────────────────────────────────────────────

export interface ProductVariant {
  _id: string;
  label: string;         // "30ml" | "50ml" | "100ml"
  sku: string;           // "UMM-OUD-R-50ML"
  price: number;         // paise
  compareAtPrice?: number;
  stock: number;
  isDefault: boolean;
}

export interface ProductImage {
  url: string;           // Cloudinary URL
  publicId: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  basePrice: number;     // paise
  compareAtPrice?: number;
  fragranceFamily: FragranceFamily;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  longevity: Longevity;
  sillage: Sillage;
  ingredients?: string;
  variants: ProductVariant[];
  inventoryPolicy: InventoryPolicy;
  trackInventory: boolean;
  images: ProductImage[];
  categories: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  metaTitle?: string;
  metaDescription?: string;
  reviewCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight product shape for listing pages & cards */
export interface ProductSummary {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice?: number;
  fragranceFamily: FragranceFamily;
  images: Pick<ProductImage, 'url' | 'alt' | 'isPrimary'>[];
  categories: string[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  reviewCount: number;
  averageRating: number;
  variants: Pick<ProductVariant, '_id' | 'label' | 'sku' | 'price' | 'stock' | 'isDefault'>[];
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  sku: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;     // paise — server-set, not trusted from client
  totalPrice: number;    // paise — unitPrice * quantity
  stock: number;         // current stock — for OOS detection
  isOutOfStock?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;       // paise
  shippingCharge: number; // paise
  total: number;          // paise
  itemCount: number;
  coupon?: AppliedCoupon;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number; // paise
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;     // paise — snapshot at order time
  totalPrice: number;    // paise
}

export interface Order {
  _id: string;
  orderNumber: string;   // "UMM-2024-00001"
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface SavedAddress extends ShippingAddress {
  _id: string;
  label: string;
  isDefault: boolean;
}

export interface UserPublic {
  _id: string;
  phone: string;
  email?: string;
  name?: string;
  isPhoneVerified: boolean;
  role: 'customer' | 'admin';
  savedAddresses: SavedAddress[];
  wishlist: string[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Checkout Types ───────────────────────────────────────────────────────────

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: PaymentMethod;
}

export interface RazorpayCheckoutData {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;          // paise
  currency: 'INR';
  orderPreview: {
    items: OrderItem[];
    subtotal: number;
    shippingCharge: number;
    discountAmount: number;
    total: number;
  };
}

// ─── Filter & Sort Types ──────────────────────────────────────────────────────

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'bestselling';

export interface ProductFilters {
  category?: string;
  fragranceFamily?: FragranceFamily;
  minPrice?: number;    // rupees (UI) — converted to paise in server
  maxPrice?: number;    // rupees (UI)
  search?: string;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}
