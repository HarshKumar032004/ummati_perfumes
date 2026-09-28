import Razorpay from 'razorpay'
import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('⚠️ Razorpay credentials missing from environment.')
}

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: RAZORPAY_KEY_SECRET || 'dummy_secret',
})

/**
 * Verifies the Razorpay webhook signature using HMAC SHA256
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')
      
    return generated_signature === signature
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Utility to verify pure webhook body signatures
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')
      
    return expectedSignature === signature
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}
