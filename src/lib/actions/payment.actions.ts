'use server'

import { v4 as uuidv4 } from 'uuid'
import dbConnect from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { razorpay } from '@/lib/services/razorpay'
import { sendOrderConfirmationEmail } from '@/lib/services/email'
import type { CheckoutFormValues } from '@/lib/validations/checkout.schema'
import type { ActionResult } from '@/types'

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `UMM-${new Date().getFullYear()}-${result}`
}

export async function createRazorpayOrder(
  checkoutSessionId: string,
  formData: CheckoutFormValues
): Promise<ActionResult<{ orderId: string, key: string, amount: number }>> {
  try {
    await dbConnect()

    // 1. Fetch Secure Session
    const sessionStr = await redis.get(`checkout_session:${checkoutSessionId}`)
    if (!sessionStr) {
      return { success: false, error: 'Checkout session expired. Please try again.' }
    }
    
    const sessionData = JSON.parse(sessionStr as string)

    // 2. Create Razorpay Order
    const options = {
      amount: sessionData.total, // amount in paise
      currency: 'INR',
      receipt: checkoutSessionId,
    }
    
    const razorpayOrder = await razorpay.orders.create(options)

    if (!razorpayOrder || !razorpayOrder.id) {
      throw new Error('Failed to create Razorpay Order')
    }

    // 3. Store pending order mapping in Redis so webhook can find it
    // The webhook needs to know what to fulfill when payment is captured
    const pendingOrderData = {
      ...sessionData,
      formData,
      orderNumber: generateOrderNumber(),
      razorpayOrderId: razorpayOrder.id
    }
    
    await redis.setex(`pending_razorpay:${razorpayOrder.id}`, 86400, JSON.stringify(pendingOrderData))

    return {
      success: true,
      data: {
        orderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID || '',
        amount: sessionData.total
      }
    }
  } catch (error) {
    console.error('[PAYMENT] createRazorpayOrder error:', error)
    return { success: false, error: 'Payment initialization failed.' }
  }
}

export async function createCODOrder(
  checkoutSessionId: string,
  formData: CheckoutFormValues
): Promise<ActionResult<{ orderNumber: string }>> {
  try {
    await dbConnect()

    // 1. Fetch Secure Session
    const sessionStr = await redis.get(`checkout_session:${checkoutSessionId}`)
    if (!sessionStr) {
      return { success: false, error: 'Checkout session expired. Please try again.' }
    }
    
    const sessionData = JSON.parse(sessionStr as string)
    const orderNumber = generateOrderNumber()

    // 2. Create Order in MongoDB
    const order = await Order.create({
      orderNumber,
      userId: sessionData.userId,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      shippingAddress: {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      items: sessionData.items,
      payment: {
        method: 'cod',
        status: 'pending' // COD is paid upon delivery
      },
      totals: {
        subtotal: sessionData.subtotal,
        shippingCharge: sessionData.shippingCharge,
        discount: 0,
        total: sessionData.total
      },
      status: 'confirmed'
    })

    // 3. Decrement Inventory & Clear Locks
    for (const item of sessionData.items) {
      // Find the product and decrement stock
      const product = await Product.findById(item.productId)
      if (product) {
        if (item.id !== item.productId) {
          // It's a variant
          const variantId = item.id.replace(`${item.productId}-`, '')
          const variant = product.variants.find((v: any) => v._id.toString() === variantId)
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity)
          }
        } else if (product.variants.length > 0) {
          // No specific variant selected but product has variants (fallback to first)
          product.variants[0].stock = Math.max(0, product.variants[0].stock - item.quantity)
        }
        await product.save()
      }
      
      // Delete temporary Redis lock
      await redis.del(`checkout_lock:${item.id}:${sessionData.userId}`)
    }

    // Delete session
    await redis.del(`checkout_session:${checkoutSessionId}`)

    // 4. Send Confirmation Email (Async)
    sendOrderConfirmationEmail(order).catch(console.error)

    return { success: true, data: { orderNumber } }
  } catch (error) {
    console.error('[PAYMENT] createCODOrder error:', error)
    return { success: false, error: 'Failed to create order. Please try again.' }
  }
}
