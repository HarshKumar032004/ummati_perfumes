'use client'

import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils/currency'
import { useCartStore } from '@/store/useCartStore'
import type { Product, ProductVariant } from '@/types'

export function AddToCartForm({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const defaultVariant = product.variants.find((variant) => variant.isDefault) || product.variants[0]
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const activePrice = selectedVariant?.price ?? product.basePrice
  const activeComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false

  async function handleAddToCart() {
    if (isOutOfStock || isAdding) return
    setIsAdding(true)
    const primaryImage = product.images.find((image) => image.isPrimary) || product.images[0]

    addItem({
      id: selectedVariant ? `${product._id}-${selectedVariant._id}` : product._id,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: activePrice,
      quantity,
      image: primaryImage?.url || '',
      variantLabel: selectedVariant?.label,
    })

    await new Promise((resolve) => setTimeout(resolve, 450))
    setIsAdding(false)
    setQuantity(1)
  }

  return (
    <div className="mt-10 border-y border-hairline py-8">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-light text-foreground">{formatPrice(activePrice)}</span>
        {activeComparePrice && activeComparePrice > activePrice && <span className="text-sm text-text-muted line-through">{formatPrice(activeComparePrice)}</span>}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-label text-text-muted">Select size</span>
            <span className="text-xs text-text-muted">{selectedVariant?.stock ? 'Available' : 'Currently unavailable'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const selected = selectedVariant?._id === variant._id
              const soldOut = variant.stock <= 0
              return (
                <button
                  key={variant._id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    'min-w-20 rounded-full border px-4 py-2.5 text-label transition-all duration-300',
                    selected ? 'border-brand-accent bg-brand-accent text-primary-foreground' : 'border-hairline text-text-muted hover:border-brand-accent hover:text-brand-accent',
                    soldOut && 'cursor-not-allowed opacity-35 line-through',
                  )}
                >
                  {variant.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-14 items-center border border-hairline">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock} className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-brand-accent disabled:opacity-30"><Minus className="h-3.5 w-3.5" strokeWidth={1.2} /></button>
          <span className="w-8 text-center text-sm text-foreground">{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => selectedVariant ? Math.min(current + 1, selectedVariant.stock) : current + 1)} disabled={isOutOfStock || Boolean(selectedVariant && quantity >= selectedVariant.stock)} className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-brand-accent disabled:opacity-30"><Plus className="h-3.5 w-3.5" strokeWidth={1.2} /></button>
        </div>
        <button type="button" onClick={handleAddToCart} disabled={isOutOfStock || isAdding} className="flex h-14 flex-1 items-center justify-center gap-3 bg-brand-accent px-5 text-label text-primary-foreground transition-all duration-300 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40">
          {isAdding ? <span className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" /> : <ShoppingBag className="h-4 w-4" strokeWidth={1.3} />}
          {isOutOfStock ? 'Sold out' : isAdding ? 'Adding to bag' : 'Add to bag'}
        </button>
      </div>
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && <p className="mt-4 text-xs text-brand-accent">Only {selectedVariant.stock} remaining in this size.</p>}
    </div>
  )
}
