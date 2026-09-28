'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles shared by all variants
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-medium tracking-wide',
    'rounded-full border border-transparent',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-brand-accent focus-visible:ring-offset-bg-base',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // ── PREMIUM: Gold fill — primary CTA ─────────────────────────────
        premium: [
          'bg-brand-accent text-primary-foreground',
          'hover:bg-foreground hover:text-background',
          'active:scale-[0.97] active:shadow-inner',
        ],

        // ── GHOST-GOLD: Outlined gold — secondary CTA ─────────────────────
        'ghost-gold': [
          'bg-transparent',
          'border-brand-accent/50 text-brand-accent',
          'hover:bg-brand-accent/10 hover:border-brand-accent',
          'active:scale-[0.97]',
        ],

        // ── DEFAULT: Dark surface — tertiary ──────────────────────────────
        default: [
          'bg-bg-elevated border-hairline text-text-secondary',
          'hover:bg-bg-surface hover:border-brand-accent/40 hover:text-foreground',
          'active:scale-[0.97]',
        ],

        // ── OUTLINE: Subtle border only ────────────────────────────────────
        outline: [
          'bg-transparent',
          'border-hairline text-text-secondary',
          'hover:bg-bg-surface hover:text-foreground',
          'active:scale-[0.97]',
        ],

        // ── GHOST: No border ──────────────────────────────────────────────
        ghost: [
          'bg-transparent border-transparent',
          'text-text-secondary',
          'hover:bg-bg-surface hover:text-foreground',
          'active:scale-[0.97]',
        ],

        // ── DESTRUCTIVE: Error state ──────────────────────────────────────
        destructive: [
          'bg-red-900/20 border-red-400/30 text-red-500',
          'hover:bg-red-900/30',
          'active:scale-[0.97]',
        ],

        // ── LINK: Text only ──────────────────────────────────────────────
        link: [
          'bg-transparent border-transparent',
          'text-brand-accent underline-offset-4',
          'hover:underline',
          'p-0 h-auto',
        ],
      },

      size: {
        xs: 'h-8 px-3 text-xs gap-1',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',       // default
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-12 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="sr-only">Loading</span>
          </>
        ) : children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
