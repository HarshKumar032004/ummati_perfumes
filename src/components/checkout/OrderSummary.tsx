'use client'

import React from 'react'
import Image from 'next/image'
import { useCartStore, useCartSubtotal } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface OrderSummaryProps {
  isSubmitting: boolean
}

export function OrderSummary({ isSubmitting }: OrderSummaryProps) {
  const items = useCartStore(state => state.items)
  const subtotal = useCartSubtotal()
  
  // Hardcoded for UI consistency, matches checkout.actions.ts
  const shipping = subtotal >= 99900 ? 0 : 10000 
  const total = subtotal + shipping

  return (
    <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6 lg:p-8 sticky top-24">
      <h2 className="font-display text-2xl text-[#F0E8D8] mb-6">Order Summary</h2>
      
      {/* ── Items ── */}
      <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative h-16 w-12 shrink-0 bg-[#1A1820] rounded border border-[#2A2530] overflow-hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#3A3540] text-[10px] text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-[#F0E8D8] line-clamp-1">{item.name}</span>
              {item.variantLabel && <span className="text-xs text-[#7A6B58]">{item.variantLabel}</span>}
            </div>
            <span className="text-sm text-[#C8A96E] font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Totals ── */}
      <div className="flex flex-col gap-3 pt-6 border-t border-[#2A2530] mb-8">
        <div className="flex justify-between text-sm text-[#C0AE95]">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#C0AE95]">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-lg font-medium text-[#F0E8D8] pt-3 border-t border-[#2A2530]">
          <span>Total</span>
          <span className="text-[#C8A96E]">{formatPrice(total)}</span>
        </div>
      </div>

      {/* ── Submit Button ── */}
      {/* Uses form="checkout-form" to trigger the form submission from outside the <form> tree */}
      <Button 
        type="submit" 
        form="checkout-form"
        variant="premium" 
        size="lg" 
        className="w-full"
        loading={isSubmitting}
      >
        {!isSubmitting && <Lock className="h-4 w-4 mr-2" />}
        {isSubmitting ? 'Processing...' : 'Place Order Securely'}
      </Button>

      <p className="text-xs text-center text-[#7A6B58] mt-4">
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
