import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-xs border px-2.5 py-0.5 text-label transition-colors',
  {
    variants: {
      variant: {
        // Gold — "Bestseller", "Featured"
        gold: [
          'bg-[#C8A96E] border-transparent',
          'text-[#09080B]',
        ],
        // Gold outline — secondary highlight
        'gold-outline': [
          'bg-transparent border-[rgba(200,169,110,0.4)]',
          'text-[#C8A96E]',
        ],
        // New Arrival
        new: [
          'bg-[#1A1820] border-[rgba(200,169,110,0.3)]',
          'text-[#C8A96E]',
        ],
        // Sold Out / Unavailable
        'sold-out': [
          'bg-[rgba(74,64,53,0.4)] border-[rgba(122,107,88,0.3)]',
          'text-[#7A6B58]',
        ],
        // Sale / Discount
        sale: [
          'bg-[rgba(107,61,61,0.4)] border-[rgba(232,154,154,0.3)]',
          'text-[#E89A9A]',
        ],
        // Success
        success: [
          'bg-[rgba(61,107,79,0.3)] border-[rgba(126,200,154,0.3)]',
          'text-[#7EC89A]',
        ],
        // Neutral / Dark
        dark: [
          'bg-[#1A1820] border-[#2A2530]',
          'text-[#C0AE95]',
        ],
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
