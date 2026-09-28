'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

// ─── Overlay ─────────────────────────────────────────────────────────────────
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

// ─── Content ─────────────────────────────────────────────────────────────────
type SheetSide = 'left' | 'right' | 'top' | 'bottom'

const sideStyles: Record<SheetSide, string> = {
  right: [
    'inset-y-0 right-0 h-full w-[min(85vw,400px)]',
    'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  ].join(' '),
  left: [
    'inset-y-0 left-0 h-full w-[min(85vw,400px)]',
    'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  ].join(' '),
  top: [
    'inset-x-0 top-0 w-full',
    'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  ].join(' '),
  bottom: [
    'inset-x-0 bottom-0 w-full',
    'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  ].join(' '),
}

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: SheetSide
  showClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col',
        'bg-bg-base border-hairline',
        side === 'left' && 'border-r',
        side === 'right' && 'border-l',
        side === 'top' && 'border-b',
        side === 'bottom' && 'border-t',
        'shadow-[0_8px_48px_rgba(0,0,0,0.7)]',
        'duration-300 ease-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:duration-200',
        sideStyles[side],
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <SheetClose
          className={cn(
            'absolute right-4 top-4 z-10',
            'flex h-9 w-9 items-center justify-center rounded-md',
            'text-text-muted transition-colors',
            'hover:bg-bg-surface hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
          )}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </SheetClose>
      )}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

// ─── Header / Footer / Title / Description ────────────────────────────────────
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1 px-6 py-5 border-b border-hairline', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-3 px-6 py-5 border-t border-hairline mt-auto', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-display text-xl font-normal text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-text-muted', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
)
SheetBody.displayName = 'SheetBody'

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
}
