import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] container-brand py-12 text-center">
      <div className="mb-8 flex size-24 items-center justify-center rounded-full border border-brand-accent/40 bg-brand-accent/10">
        <Check className="size-12 text-brand-accent" strokeWidth={1.2} />
      </div>
      <p className="mb-4 text-label text-brand-accent">Order confirmed</p>
      <h1 className="font-display text-4xl text-foreground md:text-6xl">
        Thank you
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
