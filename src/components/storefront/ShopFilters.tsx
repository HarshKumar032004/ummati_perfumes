'use client'

import React, { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { FRAGRANCE_FAMILIES, PRODUCT_CATEGORIES } from '@/lib/config/site'
import { cn } from '@/lib/utils'

export function ShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Current selections
  const currentCategory = searchParams?.get('category') || 'all'
  const currentFamily = searchParams?.get('fragranceFamily') || ''

  // Function to update URL params
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 on filter change
    params.delete('page')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className={cn('flex flex-col gap-8', isPending && 'opacity-70 pointer-events-none transition-opacity')}>
      
      {/* ── Categories ── */}
      <div>
        <h3 className="font-display mb-4 text-2xl font-light text-foreground">Categories</h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateFilter('category', 'all')}
              className={cn(
                'text-sm transition-colors',
                currentCategory === 'all' ? 'text-brand-accent' : 'text-text-muted hover:text-foreground'
              )}
            >
              All Perfumes
            </button>
          </li>
          {PRODUCT_CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => updateFilter('category', cat.slug)}
                className={cn(
                  'text-sm transition-colors',
                  currentCategory === cat.slug ? 'text-brand-accent' : 'text-text-muted hover:text-foreground'
                )}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Fragrance Family ── */}
      <div>
        <h3 className="font-display mb-4 text-2xl font-light text-foreground">Scent profile</h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateFilter('fragranceFamily', null)}
              className={cn(
                'text-sm transition-colors',
                !currentFamily ? 'text-brand-accent' : 'text-text-muted hover:text-foreground'
              )}
            >
              Any Profile
            </button>
          </li>
          {FRAGRANCE_FAMILIES.map((family) => (
            <li key={family}>
              <button
                onClick={() => updateFilter('fragranceFamily', family)}
                className={cn(
                  'text-sm transition-colors',
                currentFamily === family ? 'text-brand-accent' : 'text-text-muted hover:text-foreground'
                )}
              >
                {family}
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
