'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils/currency'
import { useCartStore } from '@/store/useCartStore'
import type { ProductSummary } from '@/types'

interface ProductCardProps {
  product: ProductSummary
  priority?: boolean
  onQuickAdd?: (product: ProductSummary) => void
  className?: string
}

export function ProductCard({ product, priority = false, onQuickAdd, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
  const alternateImage = product.images.find((img) => !img.isPrimary) ?? product.images[1]
  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0]
  const price = defaultVariant?.price ?? product.basePrice
  const compareAt = product.compareAtPrice
  const isOutOfStock = defaultVariant ? defaultVariant.stock <= 0 : false

  async function handleQuickAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (isAdding || isOutOfStock) return

    setIsAdding(true)
    const itemId = defaultVariant ? `${product._id}-${defaultVariant._id}` : product._id
    addItem({
      id: itemId,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price,
      quantity: 1,
      image: primaryImage?.url ?? '',
      variantLabel: defaultVariant?.label,
    })
    onQuickAdd?.(product)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsAdding(false)
  }

  return (
    <motion.article
      className={cn('group relative', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/product/${product.slug}`} className="block focus-visible:outline-none" aria-label={`${product.name} — ${formatPrice(price)}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-surface">
          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-700 ease-luxury group-hover:scale-[1.03] group-hover:opacity-0"
            />
          ) : null}
          {alternateImage?.url ? (
            <Image
              src={alternateImage.url}
              alt={alternateImage.alt || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-all duration-700 ease-luxury group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : null}
          {!primaryImage?.url && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated">
              <span className="font-display text-2xl italic text-text-muted">{product.name}</span>
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {product.isNewArrival && <span className="text-label text-brand-accent">New / 01</span>}
            {!product.isNewArrival && product.isBestSeller && <span className="text-label text-brand-accent">Signature</span>}
          </div>

          <motion.div
            initial={false}
            animate={{ y: isHovered ? 0 : '110%', opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute inset-x-3 bottom-3 flex items-center justify-between px-4 py-3"
          >
            <span className="text-label text-foreground">{isOutOfStock ? 'Sold out' : isAdding ? 'Adding' : 'Quick inquire'}</span>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isAdding}
              aria-label={isOutOfStock ? 'Sold out' : `Add ${product.name} to bag`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
            >
              {isAdding ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> : <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />}
            </button>
          </motion.div>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-hairline py-5">
          <div className="min-w-0">
            <p className="text-label mb-2 text-brand-accent">{product.fragranceFamily}</p>
            <h3 className="font-display text-[1.65rem] font-light leading-none tracking-[-0.02em] text-foreground transition-colors group-hover:text-brand-accent">
              {product.name}
            </h3>
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-muted">
              {[product.fragranceFamily, ...product.categories.slice(0, 2)].join(' · ')}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-foreground">{formatPrice(price)}</p>
            {compareAt && compareAt > price && <p className="mt-1 text-xs text-text-muted line-through">{formatPrice(compareAt)}</p>}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between text-text-muted">
        <div className="flex items-center gap-2" aria-label={`${product.averageRating} out of 5 stars, ${product.reviewCount} reviews`}>
          {product.reviewCount > 0 && <><Star className="h-3 w-3 fill-brand-accent text-brand-accent" /><span className="text-xs">{product.averageRating.toFixed(1)} / {product.reviewCount}</span></>}
        </div>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-accent" strokeWidth={1.2} />
      </div>
    </motion.article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-bg-surface" />
      <div className="space-y-3 border-b border-hairline py-5">
        <div className="h-2 w-16 bg-bg-elevated" />
        <div className="h-7 w-3/4 bg-bg-elevated" />
        <div className="h-3 w-1/2 bg-bg-elevated" />
      </div>
    </div>
  )
}

export default ProductCard
