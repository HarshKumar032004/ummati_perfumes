'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowRight, LockKeyhole } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendOTP, verifyOTP } from '@/lib/actions/auth.actions'
import { fadeIn, slideInRight, slideInLeft } from '@/lib/utils/animations'
import { cn } from '@/lib/utils'

export function LoginModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL dictates if the modal is open
  const isOpen = searchParams?.get('login') === 'true'
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Close modal by removing query param
  function closeModal() {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('login')
    router.replace(`?${params.toString()}`, { scroll: false })
    
    // Reset state after transition
    setTimeout(() => {
      setStep('phone')
      setPhone('')
      setOtp(['', '', '', '', '', ''])
      setError(null)
    }, 300)
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Add country code if missing
    let formattedPhone = phone.trim()
    if (!formattedPhone.startsWith('+91')) {
      formattedPhone = `+91${formattedPhone}`
    }

    const formData = new FormData()
    formData.append('phone', formattedPhone)

    const res = await sendOTP(formData)
    
    if (res.success) {
      setPhone(formattedPhone)
      setStep('otp')
    } else {
      setError(res.error || 'Failed to send OTP')
    }
    
    setIsLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP')
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('phone', phone)
    formData.append('otp', otpString)

    const res = await verifyOTP(formData)

    if (res.success) {
      closeModal()
      router.refresh() // Refresh layout to pick up new session
    } else {
      setError(res.error || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }

    setIsLoading(false)
  }

  // Handle OTP input navigation
  const handleOtpChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    
    // Handle paste
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char
      })
      setOtp(newOtp)
      // Focus the next empty input or the last one
      const nextEmpty = newOtp.findIndex(val => val === '')
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty
      otpRefs.current[focusIndex]?.focus()
      return
    }

    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value entered
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle>
            {step === 'phone' ? 'Welcome to Ummati' : 'Verify your number'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' 
              ? 'Enter your phone number to sign in or create an account.'
              : `We've sent a code to ${phone}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-[140px]">
          <AnimatePresence mode="wait">
            
            {/* ─── STEP 1: Phone Input ─── */}
            {step === 'phone' && (
              <motion.form 
                key="step-phone"
                onSubmit={handleSendOTP}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Input
                    type="tel"
                    placeholder="Mobile Number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={error || undefined}
                    disabled={isLoading}
                    autoFocus
                  />
                  {error && <p className="text-xs text-[#E89A9A]">{error}</p>}
                </div>
                
                <Button 
                  type="submit" 
                  variant="premium" 
                  className="w-full mt-2" 
                  loading={isLoading}
                  disabled={phone.replace(/\D/g, '').length < 10}
                >
                  Continue
                  {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </motion.form>
            )}

            {/* ─── STEP 2: OTP Input ─── */}
            {step === 'otp' && (
              <motion.form 
                key="step-otp"
                onSubmit={handleVerifyOTP}
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-4"
              >
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <Input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault()
                        handleOtpChange(idx, e.clipboardData.getData('text'))
                      }}
                      disabled={isLoading}
                      className={cn(
                        "w-12 h-14 text-center text-lg font-medium",
                        error && "border-[#6B3D3D] focus:border-[#E89A9A]"
                      )}
                    />
                  ))}
                </div>
                
                {error && <p className="text-xs text-center text-[#E89A9A]">{error}</p>}
                
                <div className="flex flex-col gap-3 mt-4">
                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="w-full"
                    loading={isLoading}
                    disabled={otp.join('').length !== 6}
                  >
                    Verify & Login
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone')
                      setError(null)
                    }}
                    disabled={isLoading}
                    className="text-xs text-[#7A6B58] hover:text-[#C0AE95] transition-colors"
                  >
                    Edit phone number
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
