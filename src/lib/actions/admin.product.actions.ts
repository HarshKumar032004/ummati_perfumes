'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { Product } from '@/models/Product'
import { getSession } from '@/lib/auth/session'
import type { ActionResult } from '@/types'

// Security Helper
async function verifyAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized Action')
  }
}

// Generate slug from name
const generateSlug = (name: string) => 
  name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

export async function createProduct(data: any): Promise<ActionResult<string>> {
  try {
    await verifyAdmin()
    await dbConnect()

    const slug = generateSlug(data.name)
    
    // Check slug uniqueness
    const existing = await Product.findOne({ slug })
    if (existing) {
      return { success: false, error: 'A product with a similar name already exists.' }
    }

    // Format images (handling comma separated strings for Phase 9)
    let imagesArray = []
    if (data.rawImages) {
      imagesArray = data.rawImages.split(',').map((url: string) => ({
        url: url.trim(),
        alt: data.name,
        isPrimary: false
      }))
      if (imagesArray.length > 0) imagesArray[0].isPrimary = true
    }

    const product = await Product.create({
      ...data,
      slug,
      images: imagesArray,
      // For now, auto-create a default variant if stock is provided
      variants: [{
        label: 'Default',
        sku: `UMM-${slug.substring(0,4).toUpperCase()}`,
        price: data.basePrice,
        stock: data.stock || 0,
        isDefault: true
      }]
    })

    revalidatePath('/shop')
    revalidatePath('/')
    
    return { success: true, data: product._id.toString() }
  } catch (error: any) {
    console.error('[ADMIN] Create Product Error:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

export async function getAllAdminProducts(): Promise<any[]> {
  try {
    await verifyAdmin()
    await dbConnect()
    
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error('[ADMIN] Get Admin Products Error:', error)
    return []
  }
}
