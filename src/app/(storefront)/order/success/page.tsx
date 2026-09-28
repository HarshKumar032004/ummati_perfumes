import React from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] container-brand py-12 text-center">
      <div className="mb-8">
        <CheckCircle className="h-20 w-20 text-[#C8A96E] mx-auto" />
      </div>
      
      <h1 className="font-display text-4xl md:text-5xl text-[#F0E8D8] mb-6">
        Payment Successful
      </h1>
      
      <div className="max-w-md mx-auto mb-10">
        <p className="text-[#C0AE95] text-lg leading-relaxed">
          Thank you for your purchase. We are securely processing your order and will send a confirmation email with your order details shortly.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button variant="premium" size="lg" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button variant="outline" size="lg" className="border-[#2A2530] text-[#C0AE95] hover:bg-[#1A1820]" asChild>
          <Link href="/account">View Account</Link>
        </Button>
      </div>
    </div>
  )
}
