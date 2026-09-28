import type { ProductSummary } from '@/types'

const image = (url: string, alt: string, isPrimary = true) => ({ url, alt, isPrimary })

export const demoProducts: ProductSummary[] = [
  {
    _id: 'demo-noor', slug: 'noor', name: 'Noor', shortDescription: 'White florals, saffron, and a warm amber trail.', basePrice: 349900,
    compareAtPrice: 399900, fragranceFamily: 'Floral',
    images: [image('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85', 'Noor perfume bottle')],
    categories: ['unisex', 'bestsellers'], isNewArrival: false, isBestSeller: true, reviewCount: 42, averageRating: 4.9,
    variants: [{ _id: 'demo-noor-50', label: '50ml', sku: 'UMM-NOOR-50', price: 349900, stock: 24, isDefault: true }],
  },
  {
    _id: 'demo-oud', slug: 'oud-reserve', name: 'Oud Reserve', shortDescription: 'Smoked oud, rose absolute, and deep woods.', basePrice: 429900,
    fragranceFamily: 'Woody', images: [image('https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85', 'Oud Reserve perfume bottle')],
    categories: ['men', 'attar'], isNewArrival: true, isBestSeller: false, reviewCount: 18, averageRating: 4.8,
    variants: [{ _id: 'demo-oud-30', label: '30ml', sku: 'UMM-OUD-30', price: 429900, stock: 16, isDefault: true }],
  },
  {
    _id: 'demo-rose', slug: 'rose-absolute', name: 'Rose Absolute', shortDescription: 'Kannauj rose, green tea, and sandalwood.', basePrice: 289900,
    fragranceFamily: 'Floral', images: [image('https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85', 'Rose Absolute perfume bottle')],
    categories: ['women', 'attar'], isNewArrival: false, isBestSeller: true, reviewCount: 31, averageRating: 4.7,
    variants: [{ _id: 'demo-rose-30', label: '30ml', sku: 'UMM-ROSE-30', price: 289900, stock: 12, isDefault: true }],
  },
  {
    _id: 'demo-sandal', slug: 'sandal-veil', name: 'Sandal Veil', shortDescription: 'Creamy sandalwood wrapped in iris and soft musk.', basePrice: 319900,
    fragranceFamily: 'Oriental', images: [image('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85', 'Sandal Veil perfume bottle')],
    categories: ['unisex', 'new-arrivals'], isNewArrival: true, isBestSeller: false, reviewCount: 12, averageRating: 4.8,
    variants: [{ _id: 'demo-sandal-50', label: '50ml', sku: 'UMM-SANDAL-50', price: 319900, stock: 20, isDefault: true }],
  },
]

export function getDemoProduct(slug: string) {
  return demoProducts.find((product) => product.slug === slug)
}
