'use client'

import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center container-brand text-center py-12">
      <div className="h-20 w-20 bg-[#6B3D3D]/10 rounded-full flex items-center justify-center mb-8 border border-[#6B3D3D]">
        <AlertCircle className="h-10 w-10 text-[#E89A9A]" />
      </div>
      
      <h1 className="font-display text-4xl text-[#F0E8D8] mb-4">
        Something went wrong
      </h1>
      
      <p className="text-[#C0AE95] max-w-md mx-auto mb-10 leading-relaxed">
        We encountered an unexpected error while processing your request. Our engineering team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={() => reset()} variant="premium" size="lg">
          Try Again
        </Button>
        <Button variant="outline" size="lg" className="border-[#2A2530] text-[#C0AE95] hover:bg-[#1A1820]" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
