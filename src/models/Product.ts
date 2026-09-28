import mongoose, { Schema, Document, Model } from 'mongoose'
import type { Product as IProduct, ProductVariant, ProductImage } from '@/types'

// We omit _id from IProduct for the document interface since mongoose provides it
export interface IProductDocument extends Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const ProductVariantSchema = new Schema<ProductVariant>({
  label: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // in paise
  compareAtPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  isDefault: { type: Boolean, default: false },
})

const ProductImageSchema = new Schema<ProductImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  alt: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
})

const ProductSchema = new Schema<IProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true }, // in paise
    compareAtPrice: { type: Number },
    
    // Fragrance properties
    fragranceFamily: { 
      type: String, 
      required: true,
      index: true
    },
    topNotes: [{ type: String }],
    middleNotes: [{ type: String }],
    baseNotes: [{ type: String }],
    longevity: { type: String, required: true },
    sillage: { type: String, required: true },
    ingredients: { type: String },
    
    // Inventory & Variants
    variants: [ProductVariantSchema],
    inventoryPolicy: { 
      type: String, 
      enum: ['deny', 'continue'], 
      default: 'deny' 
    },
    trackInventory: { type: Boolean, default: true },
    
    images: [ProductImageSchema],
    
    // Taxonomy
    categories: [{ type: String, index: true }],
    tags: [{ type: String }],
    
    // Status
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    
    // Social proof
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Compound index for fast faceted filtering (e.g., active products in category X sorted by price)
ProductSchema.index({ isActive: 1, categories: 1, basePrice: 1 })
ProductSchema.index({ isActive: 1, fragranceFamily: 1, basePrice: 1 })

export const Product: Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema)
