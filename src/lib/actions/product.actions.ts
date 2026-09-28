'use server'

import dbConnect from '@/lib/db/mongodb'
import { Product } from '@/models/Product'
import type { Product as IProduct, ProductSummary, ProductFilters } from '@/types'

// Map full product to a lightweight summary for catalog/grid views
function mapToSummary(doc: any): ProductSummary {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    shortDescription: doc.shortDescription,
    basePrice: doc.basePrice,
    compareAtPrice: doc.compareAtPrice,
    fragranceFamily: doc.fragranceFamily,
    images: doc.images.filter((img: any) => img.isPrimary).length > 0 
      ? doc.images.filter((img: any) => img.isPrimary)
      : [doc.images[0]].filter(Boolean),
    categories: doc.categories,
    isNewArrival: doc.isNewArrival,
    isBestSeller: doc.isBestSeller,
    reviewCount: doc.reviewCount,
    averageRating: doc.averageRating,
    variants: doc.variants.map((v: any) => ({
      _id: v._id.toString(),
      label: v.label,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      isDefault: v.isDefault
    }))
  }
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  try {
    await dbConnect()

    const query: any = { isActive: true }

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'bestsellers') {
        query.isBestSeller = true
      } else if (filters.category === 'new-arrivals') {
        query.isNewArrival = true
      } else {
        query.categories = filters.category
      }
    }
    
    if (filters.fragranceFamily) {
      query.fragranceFamily = filters.fragranceFamily
    }

    // Note: minPrice/maxPrice from UI are typically in rupees, but our DB stores paise.
    // If we expect them in paise directly from the caller, we use them as-is.
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.basePrice = {}
      if (filters.minPrice !== undefined) query.basePrice.$gte = filters.minPrice
      if (filters.maxPrice !== undefined) query.basePrice.$lte = filters.maxPrice
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { shortDescription: { $regex: filters.search, $options: 'i' } },
      ]
    }

    // Determine sorting
    let sort: any = { createdAt: -1 } // newest default
    switch (filters.sortBy) {
      case 'price_asc': sort = { basePrice: 1 }; break
      case 'price_desc': sort = { basePrice: -1 }; break
      case 'rating': sort = { averageRating: -1 }; break
      case 'bestselling': sort = { isBestSeller: -1, reviewCount: -1 }; break
      case 'featured': sort = { isFeatured: -1, createdAt: -1 }; break
      default: break
    }

    const docs = await Product.find(query)
      .sort(sort)
      .limit(filters.limit || 50)
      .lean()

    return docs.map(mapToSummary)
  } catch (error) {
    console.error('[PRODUCTS] getProducts error:', error)
    return []
  }
}

export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  try {
    await dbConnect()
    const docs = await Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return docs.map(mapToSummary)
  } catch (error) {
    console.error('[PRODUCTS] getFeaturedProducts error:', error)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  try {
    await dbConnect()
    const doc = await Product.findOne({ slug, isActive: true }).lean()
    
    if (!doc) return null
    
    // Convert ObjectIds to strings
    return {
      ...doc,
      _id: doc._id.toString(),
      variants: doc.variants.map((v: any) => ({
        ...v,
        _id: v._id.toString()
      })),
      images: doc.images.map((img: any) => ({
        ...img,
        _id: img._id?.toString()
      }))
    } as unknown as IProduct
  } catch (error) {
    console.error(`[PRODUCTS] getProductBySlug error (${slug}):`, error)
    return null
  }
}
