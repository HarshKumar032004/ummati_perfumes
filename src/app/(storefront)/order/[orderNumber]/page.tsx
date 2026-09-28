import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getOrderByNumber } from '@/lib/actions/order.actions'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Package, Truck, Home, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: CheckCircle2 },
  { id: 'confirmed', label: 'Confirmed', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
]

export default async function OrderStatusPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = await getOrderByNumber(orderNumber)

  if (!order) {
    notFound()
  }

  // Determine current step index
  let currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status)
  // If processing, map it to confirmed visually
  if (order.status === 'processing') currentStepIndex = 1
  // If cancelled, we don't show the standard timeline
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="container-brand py-12 lg:py-20 max-w-4xl">
      
      {/* ── Header ── */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl text-[#F0E8D8] mb-4">
          Thank you, {order.customer.name.split(' ')[0]}!
        </h1>
        <p className="text-[#C0AE95]">
          Your order <strong className="text-[#C8A96E]">#{order.orderNumber}</strong> has been received.
        </p>
      </div>

      {/* ── Status Timeline ── */}
      <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6 md:p-8 mb-8">
        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-[#E89A9A] mb-4" />
            <h2 className="text-xl text-[#F0E8D8] font-medium mb-2">Order Cancelled</h2>
            <p className="text-[#7A6B58] text-center">This order has been cancelled and refunded.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex justify-between items-center relative z-10">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.id} className="flex flex-col items-center gap-3 bg-[#110F14] px-2">
                    <div 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 border-2",
                        isActive 
                          ? "bg-[#C8A96E]/10 border-[#C8A96E] text-[#C8A96E]" 
                          : "bg-[#1A1820] border-[#2A2530] text-[#4A4035]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-xs md:text-sm font-medium",
                      isActive ? "text-[#F0E8D8]" : "text-[#7A6B58]"
                    )}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Connecting Line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-[#2A2530] -z-0">
              <div 
                className="h-full bg-[#C8A96E] transition-all duration-500 ease-out"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ── Order Items & Totals ── */}
        <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6 md:p-8">
          <h3 className="font-display text-xl text-[#F0E8D8] mb-6">Order Summary</h3>
          
          <div className="flex flex-col gap-6 mb-8">
            {order.items.map((item: any) => (
              <div key={item._id || item.productId} className="flex gap-4">
                <div className="relative h-20 w-16 bg-[#1A1820] border border-[#2A2530] rounded-md overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="text-[#F0E8D8] font-medium">{item.name}</h4>
                    {item.variantLabel && <p className="text-xs text-[#7A6B58] mt-1">{item.variantLabel}</p>}
                    <p className="text-xs text-[#7A6B58] mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-[#C8A96E] font-medium text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#2A2530]">
            <div className="flex justify-between text-sm text-[#C0AE95]">
              <span>Subtotal</span>
              <span>{formatPrice(order.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#C0AE95]">
              <span>Shipping</span>
              <span>{order.totals.shippingCharge === 0 ? 'Free' : formatPrice(order.totals.shippingCharge)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium text-[#F0E8D8] pt-3 mt-1 border-t border-[#2A2530]">
              <span>Total</span>
              <span className="text-[#C8A96E]">{formatPrice(order.totals.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping Info ── */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6 md:p-8">
            <h3 className="font-display text-xl text-[#F0E8D8] mb-4">Shipping Address</h3>
            <div className="text-[#C0AE95] text-sm leading-relaxed">
              <p className="text-[#F0E8D8] font-medium mb-1">{order.customer.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p className="mt-4 pt-4 border-t border-[#2A2530]">
                <span className="text-[#7A6B58]">Phone:</span> {order.customer.phone}<br/>
                <span className="text-[#7A6B58]">Email:</span> {order.customer.email}
              </p>
            </div>
          </div>

          <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6 md:p-8">
             <h3 className="font-display text-xl text-[#F0E8D8] mb-4">Payment Method</h3>
             <p className="text-[#C0AE95] capitalize">
               {order.payment.method === 'razorpay' ? 'Prepaid (Razorpay)' : 'Cash on Delivery'}
             </p>
          </div>
        </div>

      </div>

      <div className="mt-12 text-center">
        <Button variant="premium" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

    </div>
  )
}
