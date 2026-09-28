import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { verifyWebhookSignature } from '@/lib/services/razorpay'
import { sendOrderConfirmationEmail } from '@/lib/services/email'

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 1. Verify Signature
    const isValid = verifyWebhookSignature(bodyText, signature, RAZORPAY_WEBHOOK_SECRET)
    if (!isValid) {
      console.error('[WEBHOOK] Invalid Razorpay signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(bodyText)

    // 2. Handle 'payment.captured'
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity
      const razorpayOrderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id

      await dbConnect()

      // Idempotency check: Does this order already exist?
      const existingOrder = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId })
      if (existingOrder) {
        console.log(`[WEBHOOK] Order ${razorpayOrderId} already processed. Skipping.`)
        return NextResponse.json({ status: 'ok' })
      }

      // 3. Fetch Pending Order Data from Redis
      const pendingDataStr = await redis.get(`pending_razorpay:${razorpayOrderId}`)
      if (!pendingDataStr) {
        // Fallback: This is rare, but if Redis key expired and payment succeeded,
        // we might have to manually handle or query Razorpay. For now, log critical error.
        console.error(`[WEBHOOK CRITICAL] Pending data not found in Redis for order ${razorpayOrderId}`)
        return NextResponse.json({ error: 'Pending session missing' }, { status: 400 })
      }

      const sessionData = JSON.parse(pendingDataStr as string)

      // 4. Create Permanent Order Document
      const newOrder = await Order.create({
        orderNumber: sessionData.orderNumber,
        userId: sessionData.userId,
        customer: {
          name: sessionData.formData.name,
          email: sessionData.formData.email,
          phone: sessionData.formData.phone
        },
        shippingAddress: {
          line1: sessionData.formData.line1,
          line2: sessionData.formData.line2,
          city: sessionData.formData.city,
          state: sessionData.formData.state,
          pincode: sessionData.formData.pincode
        },
        items: sessionData.items,
        payment: {
          method: 'razorpay',
          status: 'paid',
          razorpayOrderId,
          razorpayPaymentId
        },
        totals: {
          subtotal: sessionData.subtotal,
          shippingCharge: sessionData.shippingCharge,
          discount: 0,
          total: sessionData.total
        },
        status: 'confirmed'
      })

      // 5. Decrement Inventory & Clear Locks
      for (const item of sessionData.items) {
        const product = await Product.findById(item.productId)
        if (product) {
          if (item.id !== item.productId) {
            const variantId = item.id.replace(`${item.productId}-`, '')
            const variant = product.variants.find((v: any) => v._id.toString() === variantId)
            if (variant) {
              variant.stock = Math.max(0, variant.stock - item.quantity)
            }
          } else if (product.variants.length > 0) {
            product.variants[0].stock = Math.max(0, product.variants[0].stock - item.quantity)
          }
          await product.save()
        }
        
        await redis.del(`checkout_lock:${item.id}:${sessionData.userId}`)
      }

      // 6. Cleanup
      await redis.del(`pending_razorpay:${razorpayOrderId}`)
      
      console.log(`[WEBHOOK] Order ${newOrder.orderNumber} successfully captured and created.`)

      // 7. Send Confirmation Email
      sendOrderConfirmationEmail(newOrder).catch(console.error)
    }

    return NextResponse.json({ status: 'ok' })
    
  } catch (error) {
    console.error('[WEBHOOK ERROR]:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
