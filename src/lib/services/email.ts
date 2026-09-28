import { Resend } from 'resend'
import { formatPrice } from '@/lib/utils/currency'
import { siteConfig } from '@/lib/config/site'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')
const SENDER_EMAIL = 'orders@ummatiperfumes.com' // Ensure this domain is verified in Resend

export async function sendOrderConfirmationEmail(order: any) {
  try {
    // Construct HTML inline styled matching the luxury brand aesthetic
    const htmlBody = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #09080B; color: #F0E8D8; border: 1px solid #2A2530;">
        
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 28px; letter-spacing: 0.1em; color: #C8A96E; margin: 0;">UMMATI</h1>
          <p style="color: #7A6B58; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 8px;">Order Confirmation</p>
        </div>

        <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 16px;">Hello ${order.customer.name},</h2>
        <p style="color: #C0AE95; line-height: 1.6; margin-bottom: 32px;">
          Thank you for choosing Ummati Perfumes. We have successfully received your order <strong>#${order.orderNumber}</strong>. 
          We are preparing your handcrafted fragrances for dispatch.
        </p>

        <div style="background-color: #110F14; border: 1px solid #2A2530; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #7A6B58; margin-top: 0; border-bottom: 1px solid #2A2530; padding-bottom: 12px; margin-bottom: 16px;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2A2530;">
                    <p style="margin: 0; font-weight: 500;">${item.name}</p>
                    ${item.variantLabel ? `<p style="margin: 4px 0 0; font-size: 12px; color: #7A6B58;">${item.variantLabel}</p>` : ''}
                    <p style="margin: 4px 0 0; font-size: 12px; color: #7A6B58;">Qty: ${item.quantity}</p>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2A2530; text-align: right; color: #C8A96E;">
                    ${formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr>
                <td style="padding: 4px 0; color: #C0AE95;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right;">${formatPrice(order.totals.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #C0AE95;">Shipping</td>
                <td style="padding: 4px 0; text-align: right;">${order.totals.shippingCharge === 0 ? 'Free' : formatPrice(order.totals.shippingCharge)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0; font-size: 16px; font-weight: 600; color: #F0E8D8; border-top: 1px solid #2A2530;">Total</td>
                <td style="padding: 12px 0 0; font-size: 16px; font-weight: 600; color: #C8A96E; text-align: right; border-top: 1px solid #2A2530;">${formatPrice(order.totals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #7A6B58; margin-bottom: 12px;">Shipping Address</h3>
          <p style="color: #C0AE95; line-height: 1.6; margin: 0;">
            ${order.shippingAddress.line1}<br>
            ${order.shippingAddress.line2 ? `${order.shippingAddress.line2}<br>` : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}
          </p>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #2A2530;">
          <p style="color: #7A6B58; font-size: 12px; margin-bottom: 16px;">If you have any questions, reply to this email or contact our support team.</p>
          <a href="${siteConfig.url}/order/${order.orderNumber}" style="display: inline-block; background-color: #C8A96E; color: #09080B; text-decoration: none; padding: 12px 24px; font-weight: 500; font-size: 14px; border-radius: 4px;">View Order Status</a>
        </div>

      </div>
    `

    // Wrapping in try/catch to ensure critical order flow is never interrupted by email failure
    const response = await resend.emails.send({
      from: `Ummati Perfumes <${SENDER_EMAIL}>`,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlBody,
    })

    console.log(`[EMAIL] Order confirmation sent to ${order.customer.email}`, response.data?.id)
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send order confirmation to ${order?.customer?.email}:`, error)
  }
}
