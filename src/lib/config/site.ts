/**
 * Site-wide configuration constants
 * Single source of truth for brand metadata, URLs, and feature flags.
 */

export const siteConfig = {
  name: 'Ummati Perfumes',
  tagline: 'Wear the Invisible',
  description:
    'Premium D2C fragrance brand crafting modern, sophisticated perfumes for the discerning Indian customer.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ummatiperfumes.com',
  ogImage: '/og-image.jpg',
  email: 'hello@ummatiperfumes.com',
  phone: '+91 98765 43210',
  social: {
    instagram: 'https://instagram.com/ummatiperfumes',
    facebook:  'https://facebook.com/ummatiperfumes',
    whatsapp:  'https://wa.me/919876543210',
  },
  shipping: {
    freeShippingThreshold: 99900, // ₹999 in paise
    standardCharge: 9900,         // ₹99 in paise
    estimatedDays: '4–7 business days',
    expressAvailable: false,
  },
  pagination: {
    productsPerPage: 20,
    reviewsPerPage: 10,
    ordersPerPage: 15,
  },
} as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

export type IndianState = typeof INDIAN_STATES[number]

export const FRAGRANCE_FAMILIES = [
  'Oriental', 'Floral', 'Woody', 'Fresh', 'Citrus',
  'Fougere', 'Chypre', 'Gourmand', 'Aquatic',
] as const

export const PRODUCT_CATEGORIES = [
  { slug: 'women',       label: "Women's" },
  { slug: 'men',         label: "Men's" },
  { slug: 'unisex',      label: 'Unisex' },
  { slug: 'attar',       label: 'Attar' },
  { slug: 'gift-sets',   label: 'Gift Sets' },
  { slug: 'bestsellers', label: 'Best Sellers' },
  { slug: 'new-arrivals',label: 'New Arrivals' },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed:           'Order Placed',
  confirmed:        'Confirmed',
  processing:       'Being Prepared',
  shipped:          'Shipped',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  return_requested: 'Return Requested',
  returned:         'Returned',
}
