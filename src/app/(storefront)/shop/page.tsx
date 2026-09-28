import React from 'react'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/actions/product.actions'
import { ShopFilters } from '@/components/storefront/ShopFilters'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Filter } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import type { FragranceFamily } from '@/types'

export const metadata: Metadata = {
  title: 'Shop All Perfumes',
  description: 'Explore the full collection of Ummati premium fragrances.',
}

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  
  // Parse filters
  const category = typeof params.category === 'string' ? params.category : undefined
  const fragranceFamily = typeof params.fragranceFamily === 'string' ? params.fragranceFamily as FragranceFamily : undefined
  
  const products = await getProducts({ category, fragranceFamily })

  return (
    <div className="container-brand py-20 lg:py-32">
      
      {/* ── Header ── */}
      <div className="mb-16 flex flex-col gap-6 border-b border-hairline pb-12 lg:flex-row lg:items-end lg:justify-between">
        <div>
        <p className="text-label mb-5 text-brand-accent">The collection / 01</p>
        <h1 className="text-display-xl text-foreground">
          {category === 'new-arrivals' ? 'New Arrivals' :
           category === 'bestsellers' ? 'Best Sellers' :
           category === 'women' ? "Women's Fragrances" :
           category === 'men' ? "Men's Fragrances" :
           category === 'unisex' ? 'Unisex Fragrances' :
           category === 'attar' ? 'Premium Attars' :
           'The Collection'}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-[1.8] text-text-muted">
          Discover our masterfully blended fragrances. Each scent is a unique journey crafted from the finest ingredients worldwide.
        </p></div>
        <span className="text-label text-text-muted">Curated in small batches</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* ── Mobile Filter Trigger ── */}
        <div className="lg:hidden w-full flex justify-end mb-4">
          <Sheet>
            <SheetTrigger className="flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-label text-text-secondary hover:border-brand-accent hover:text-brand-accent">
              <Filter className="h-4 w-4" />
              Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <ShopFilters />
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-[240px] shrink-0 sticky top-32">
          <ShopFilters />
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1 w-full">
          {products.length === 0 ? (
            <div className="border-y border-dashed border-hairline py-20 text-center">
              <p className="text-text-muted">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-16 sm:gap-x-7 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  priority={i < 4} // LCP optimization for top row
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
