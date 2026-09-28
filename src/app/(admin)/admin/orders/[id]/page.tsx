import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Order } from '@/models/Order'
import { getSession } from '@/lib/auth/session'
import { formatPrice } from '@/lib/utils/currency'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return null

  const { id } = await params
  await dbConnect()
  const order = await Order.findById(id).lean()

  if (!order) {
    notFound()
  }

  // Cast for TypeScript
  const safeOrder = JSON.parse(JSON.stringify(order))

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-[#C0AE95] hover:text-[#F0E8D8]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl text-[#F0E8D8]">Order {safeOrder.orderNumber}</h1>
        <span className="capitalize text-[#110F14] px-2 py-1 bg-[#C8A96E] rounded text-sm ml-4 font-medium">
          {safeOrder.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Col */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Items */}
          <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6">
            <h2 className="font-display text-xl text-[#F0E8D8] mb-6">Line Items</h2>
            <div className="flex flex-col gap-4">
              {safeOrder.items.map((item: any) => (
                <div key={item._id || item.productId} className="flex gap-4 p-4 bg-[#0A090C] rounded-lg border border-[#1F1C23]">
                  <div className="relative h-16 w-12 bg-[#1A1820] rounded overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-[#F0E8D8] font-medium">{item.name}</p>
                      {item.variantLabel && <p className="text-xs text-[#7A6B58]">{item.variantLabel}</p>}
                      <p className="text-sm text-[#C0AE95] mt-1">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <span className="text-[#C8A96E] font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6">
            <h2 className="font-display text-xl text-[#F0E8D8] mb-6">Financials</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-[#C0AE95]">
                <span>Subtotal</span>
                <span>{formatPrice(safeOrder.totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#C0AE95]">
                <span>Shipping</span>
                <span>{formatPrice(safeOrder.totals.shippingCharge)}</span>
              </div>
              <div className="flex justify-between text-[#F0E8D8] font-medium pt-4 border-t border-[#2A2530] mt-2">
                <span>Total</span>
                <span className="text-[#C8A96E]">{formatPrice(safeOrder.totals.total)}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#2A2530]">
              <p className="text-[#7A6B58] text-sm">
                Payment Method: <span className="text-[#F0E8D8] capitalize">{safeOrder.payment.method}</span>
                <br/>
                Payment Status: <span className="text-[#F0E8D8] capitalize">{safeOrder.payment.status}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Sidebar Col */}
        <div className="space-y-8">
          
          {/* Interactive Form Component */}
          <OrderStatusForm orderId={safeOrder._id} currentStatus={safeOrder.status} />

          {/* Customer & Shipping */}
          <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6">
            <h2 className="font-display text-xl text-[#F0E8D8] mb-4">Customer Details</h2>
            <p className="text-[#F0E8D8] font-medium">{safeOrder.customer.name}</p>
            <p className="text-sm text-[#C0AE95] mt-1">{safeOrder.customer.email}</p>
            <p className="text-sm text-[#C0AE95]">{safeOrder.customer.phone}</p>

            <h3 className="font-display text-lg text-[#F0E8D8] mt-6 mb-2">Shipping Address</h3>
            <div className="text-sm text-[#C0AE95]">
              <p>{safeOrder.shippingAddress.line1}</p>
              {safeOrder.shippingAddress.line2 && <p>{safeOrder.shippingAddress.line2}</p>}
              <p>{safeOrder.shippingAddress.city}, {safeOrder.shippingAddress.state} {safeOrder.shippingAddress.pincode}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
