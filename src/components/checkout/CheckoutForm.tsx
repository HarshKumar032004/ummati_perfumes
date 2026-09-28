'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations/checkout.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreditCard, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormValues) => void
  isSubmitting: boolean
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'razorpay',
    },
  })

  const paymentMethod = watch('paymentMethod')

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      
      {/* ── Contact & Shipping ── */}
      <section>
        <h2 className="font-display text-2xl text-[#F0E8D8] mb-6">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full Name"
            {...register('name')}
            error={errors.name?.message}
            className="md:col-span-2"
          />
          <Input
            placeholder="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            placeholder="Phone (10 digits)"
            type="tel"
            maxLength={10}
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            placeholder="Address Line 1"
            {...register('line1')}
            error={errors.line1?.message}
            className="md:col-span-2"
          />
          <Input
            placeholder="Address Line 2 (Optional)"
            {...register('line2')}
            error={errors.line2?.message}
            className="md:col-span-2"
          />
          <Input
            placeholder="City"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            placeholder="State"
            {...register('state')}
            error={errors.state?.message}
          />
          <Input
            placeholder="PIN Code"
            type="text"
            maxLength={6}
            {...register('pincode')}
            error={errors.pincode?.message}
            className="md:col-span-2"
          />
        </div>
      </section>

      {/* ── Payment Method ── */}
      <section>
        <h2 className="font-display text-2xl text-[#F0E8D8] mb-6">Payment Method</h2>
        <div className="flex flex-col gap-4">
          
          {/* Razorpay Option */}
          <label
            className={cn(
              'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
              paymentMethod === 'razorpay'
                ? 'border-[#C8A96E] bg-[rgba(200,169,110,0.05)]'
                : 'border-[#2A2530] bg-[#110F14] hover:border-[#4A4035]'
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                value="razorpay"
                className="w-4 h-4 text-[#C8A96E] bg-transparent border-[#2A2530] focus:ring-[#C8A96E]"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setValue('paymentMethod', 'razorpay')}
              />
            </div>
            <div className="ml-3 flex flex-col">
              <span className="flex items-center gap-2 text-[#F0E8D8] font-medium">
                <CreditCard className="h-4 w-4 text-[#C8A96E]" />
                UPI, Cards & Netbanking
              </span>
              <span className="text-sm text-[#7A6B58] mt-1">
                Secure checkout powered by Razorpay.
              </span>
            </div>
          </label>

          {/* COD Option */}
          <label
            className={cn(
              'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
              paymentMethod === 'cod'
                ? 'border-[#C8A96E] bg-[rgba(200,169,110,0.05)]'
                : 'border-[#2A2530] bg-[#110F14] hover:border-[#4A4035]'
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                value="cod"
                className="w-4 h-4 text-[#C8A96E] bg-transparent border-[#2A2530] focus:ring-[#C8A96E]"
                checked={paymentMethod === 'cod'}
                onChange={() => setValue('paymentMethod', 'cod')}
              />
            </div>
            <div className="ml-3 flex flex-col">
              <span className="flex items-center gap-2 text-[#F0E8D8] font-medium">
                <IndianRupee className="h-4 w-4 text-[#C8A96E]" />
                Cash on Delivery
              </span>
              <span className="text-sm text-[#7A6B58] mt-1">
                Pay when your package arrives.
              </span>
            </div>
          </label>

        </div>
        {errors.paymentMethod && (
          <p className="text-sm text-[#E89A9A] mt-2">{errors.paymentMethod.message}</p>
        )}
      </section>

      {/* Note: Submit button is intentionally placed in the OrderSummary for desktop layout,
          but we also render it here for mobile if needed, or trigger it via form="checkout-form".
          We'll rely on the external trigger approach to keep the UI clean. */}
    </form>
  )
}
