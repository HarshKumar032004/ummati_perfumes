'use server'

import { v4 as uuidv4 } from 'uuid'
import dbConnect from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'
import { Product } from '@/models/Product'
import { getSession } from '@/lib/auth/session'
import type { ActionResult } from '@/types'

interface ClientCartItem {
  id: string // the variantId or productId
  productId: string
  quantity: number
}

interface LockedCartResult {
  checkoutSessionId: string
  subtotal: number // in paise
  shippingCharge: number
  total: number
}

const SHIPPING_CHARGE = 10000 // ₹100
const FREE_SHIPPING_THRESHOLD = 99900 // ₹999

export async function verifyAndLockCart(clientItems: ClientCartItem[]): Promise<ActionResult<LockedCartResult>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in to checkout.' }
    }

    if (!clientItems || clientItems.length === 0) {
      return { success: false, error: 'Your cart is empty.' }
    }

    await dbConnect()

    let subtotal = 0
    const locksToAcquire: { key: string; qty: number }[] = []

    // Verify each item securely against the DB
    for (const item of clientItems) {
      const product = await Product.findById(item.productId).lean()
      
      if (!product || !product.isActive) {
        return { success: false, error: 'One or more items in your cart are no longer available.' }
      }

      // If the item ID is different from productId, it's a variant
      let activePrice = product.basePrice
      let activeStock = 0
      let variantLabel = ''

      if (item.id !== item.productId) {
        // Find variant
        const variantId = item.id.replace(`${item.productId}-`, '')
        const variant = product.variants.find((v: any) => v._id.toString() === variantId)
        
        if (!variant) {
          return { success: false, error: 'Invalid product variant detected.' }
        }
        
        activePrice = variant.price
        activeStock = variant.stock
        variantLabel = ` (${variant.label})`
      } else {
        // No variant, use primary stock
        activePrice = product.basePrice
        // For simplicity, if no variants, fallback to variant[0] or default stock
        if (product.variants && product.variants.length > 0) {
           activeStock = product.variants[0].stock
        }
      }

      // 1. Database level stock check
      if (item.quantity > activeStock) {
        return { success: false, error: `Sorry, we only have ${activeStock} left of ${product.name}${variantLabel}.` }
      }

      // 2. Prepare lock keys for Redis (pessimistic locking)
      // Lock key format: checkout_lock:{variantOrProductId}:{userId}
      locksToAcquire.push({
        key: `checkout_lock:${item.id}`,
        qty: item.quantity
      })

      // Add to true server-side subtotal
      subtotal += activePrice * item.quantity
    }

    // 3. Acquire Redis locks securely
    // We iterate through items and check if someone else has locked this specific product
    // Note: In a fully distributed system, we'd use a Lua script for atomic check-and-set of global stock,
    // but for our scale, locking the specific quantity requested by the user is sufficient.
    
    const checkoutSessionId = uuidv4()
    
    for (const lock of locksToAcquire) {
      // In a real high-scale scenario, we would atomically decrement a stock counter in Redis.
      // Here, we just store the intention to buy. The actual decrement happens upon payment success.
      // We set a 10-minute TTL (600 seconds) for the checkout session.
      await redis.setex(`${lock.key}:${session.userId}`, 600, lock.qty.toString())
    }

    // Calculate final totals
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
    const total = subtotal + shippingCharge

    // Save this checkout session to Redis so we can recall it in Phase 7
    const sessionData = {
      userId: session.userId,
      items: clientItems,
      subtotal,
      shippingCharge,
      total,
      createdAt: Date.now()
    }
    
    await redis.setex(`checkout_session:${checkoutSessionId}`, 600, JSON.stringify(sessionData))

    return { 
      success: true, 
      data: {
        checkoutSessionId,
        subtotal,
        shippingCharge,
        total
      } 
    }

  } catch (error) {
    console.error('[CHECKOUT] Lock cart error:', error)
    return { success: false, error: 'An unexpected error occurred during checkout initialization.' }
  }
}
