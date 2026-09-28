'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { verifyAndLockCart } from '@/lib/actions/checkout.actions'
import { createCODOrder, createRazorpayOrder } from '@/lib/actions/payment.actions'
import type { CheckoutFormValues } from '@/lib/validations/checkout.schema'
import Script from 'next/script'
// We will use standard window.alert or a simple UI state for errors until we implement shadcn Toast
import { AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, closeCart, clearCart } = useCartStore()
  
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Client-side protection & state initialization
  useEffect(() => {
    setMounted(true)
    closeCart() // Ensure drawer is closed
  }, [closeCart])

  // Redirect to shop if cart is empty after mount
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/shop')
    }
  }, [mounted, items.length, router])

  // Prevent hydration mismatch or showing checkout when empty
  if (!mounted || items.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  // 2. Form Submission & Redis Lock
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Map Zustand items to the securely required format
      const clientCartItems = items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity
      }))

      // Call the Server Action
      const result = await verifyAndLockCart(clientCartItems)

      if (!result.success) {
        // e.g. "Sorry, we only have X left of Y" or "Unauthorized"
        setError(result.error || 'Failed to verify cart. Please try again.')
        
        // If unauthorized, redirect to login
        if (result.error?.includes('Unauthorized')) {
          router.push('/?login=true')
        }
        return
      }

      // 3. Lock Succeeded
      const { checkoutSessionId, total } = result.data!
      
      // 3. Process Payment
      if (data.paymentMethod === 'cod') {
        const codResult = await createCODOrder(checkoutSessionId, data)
        if (!codResult.success) throw new Error(codResult.error)
        
        clearCart()
        router.push(`/order/${codResult.data?.orderNumber}`)
      } else {
        const rzpResult = await createRazorpayOrder(checkoutSessionId, data)
        if (!rzpResult.success) throw new Error(rzpResult.error)
        if (!rzpResult.data) throw new Error("Payment data missing")

        const options = {
          key: rzpResult.data.key,
          amount: rzpResult.data.amount,
          currency: 'INR',
          name: 'Ummati Perfumes',
          description: 'Premium Fragrance Order',
          order_id: rzpResult.data.orderId,
          handler: function (response: any) {
            // Note: DB creation is handled securely by the webhook.
            // We just clear cart and redirect.
            clearCart()
            router.push(`/order/success?payment_id=${response.razorpay_payment_id}`)
          },
          prefill: {
            name: data.name,
            email: data.email,
            contact: data.phone,
          },
          theme: {
            color: '#C8A96E',
          },
        }

        // @ts-ignore - Razorpay is loaded via script
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          console.error(response.error)
          setError('Payment failed. Please try again.')
        })
        rzp.open()
      }

    } catch (err: any) {
      console.error('Checkout submit error:', err)
      setError(err.message || 'A network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container-brand py-8 lg:py-16">
      <h1 className="font-display text-4xl text-[#F0E8D8] mb-8 lg:mb-12 text-center lg:text-left">
        Secure Checkout
      </h1>

      {error && (
        <div className="mb-8 p-4 bg-[#6B3D3D]/20 border border-[#6B3D3D] rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#E89A9A] shrink-0 mt-0.5" />
          <p className="text-[#E89A9A] text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        {/* Left Col: Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <CheckoutForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <OrderSummary isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
    </>
  )
}
