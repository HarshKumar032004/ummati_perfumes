'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useCartStore, useCartSubtotal } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils/currency'
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, giftWrap, giftNote, setGiftWrap, setGiftNote } = useCartStore()
  const subtotal = useCartSubtotal()
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false)

  if (!mounted) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="glass w-[min(92vw,480px)] bg-bg-base/95 p-0" showClose={false}>
        <SheetHeader className="flex flex-row items-center justify-between border-b border-hairline px-6 py-6">
          <div>
            <p className="text-label mb-2 text-brand-accent">Your selection</p>
            <SheetTitle className="font-display text-3xl font-light text-foreground">The bag</SheetTitle>
          </div>
          <SheetClose className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent"><X className="h-5 w-5" strokeWidth={1.2} /><span className="sr-only">Close cart</span></SheetClose>
        </SheetHeader>

        <SheetBody className="px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[25rem] flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-6 h-7 w-7 text-brand-accent" strokeWidth={1.1} />
              <p className="font-display text-3xl font-light text-foreground">Nothing here yet.</p>
              <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-text-muted">Begin with a fragrance, and let the rest follow.</p>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="mt-8 border-b border-brand-accent pb-2 text-label text-brand-accent">Explore the collection</Link>
            </div>
          ) : (
            <div className="space-y-7">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-hairline pb-7">
                  <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-bg-surface">
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.slug}`} onClick={() => setIsOpen(false)} className="font-display text-2xl font-light leading-none text-foreground transition-colors hover:text-brand-accent">{item.name}</Link>
                        {item.variantLabel && <p className="mt-2 text-label text-text-muted">{item.variantLabel}</p>}
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="text-text-muted transition-colors hover:text-brand-accent"><X className="h-4 w-4" strokeWidth={1.2} /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-text-muted transition-colors hover:text-brand-accent"><Minus className="h-3.5 w-3.5" strokeWidth={1.2} /></button>
                        <span className="min-w-4 text-center text-sm text-foreground">{item.quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-text-muted transition-colors hover:text-brand-accent"><Plus className="h-3.5 w-3.5" strokeWidth={1.2} /></button>
                      </div>
                      <span className="text-sm text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetBody>

        {items.length > 0 && (
          <SheetFooter className="border-t border-hairline bg-bg-surface/70 px-6 py-6">
            <div className="w-full space-y-5">
              <div className="flex items-end justify-between"><span className="text-label text-text-muted">Subtotal</span><span className="font-display text-3xl font-light text-foreground">{formatPrice(subtotal)}</span></div>
              <div aria-live="polite" className="space-y-2">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{subtotal >= 99900 ? 'Complimentary delivery unlocked' : `Add ${formatPrice(99900 - subtotal)} for complimentary delivery`}</span>
                  <span>{Math.min(100, Math.round((subtotal / 99900) * 100))}%</span>
                </div>
                <div className="h-1 overflow-hidden bg-bg-elevated" role="progressbar" aria-valuemin={0} aria-valuemax={99900} aria-valuenow={Math.min(subtotal, 99900)} aria-label="Free shipping progress">
                  <div className="h-full bg-brand-accent transition-[width] duration-500" style={{ width: `${Math.min(100, (subtotal / 99900) * 100)}%` }} />
                </div>
              </div>
              <div className="border-y border-hairline py-4">
                <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-text-secondary">
                  <span>Wrap as a gift</span>
                  <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="sr-only peer" />
                  <span aria-hidden className="relative h-5 w-9 rounded-full border border-hairline transition-colors peer-checked:bg-brand-accent"><span className="absolute left-1 top-1 size-3 rounded-full bg-text-muted transition-transform peer-checked:translate-x-4 peer-checked:bg-primary-foreground" /></span>
                </label>
                {giftWrap && <textarea value={giftNote} onChange={(event) => setGiftNote(event.target.value)} maxLength={240} placeholder="A note for the recipient (optional)" className="mt-4 min-h-20 w-full resize-none border border-hairline bg-bg-base p-3 text-sm text-foreground outline-none placeholder:text-text-muted focus:border-brand-accent" />}
              </div>
              <p className="text-xs leading-relaxed text-text-muted">Shipping and taxes are calculated at checkout.</p>
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="flex h-14 w-full items-center justify-center gap-3 bg-brand-accent text-label text-primary-foreground transition-colors hover:bg-foreground hover:text-background">Continue to checkout <ArrowRight /></Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
