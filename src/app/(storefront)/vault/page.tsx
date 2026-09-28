'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ProductCard } from '@/components/storefront/ProductCard'
import { demoProducts } from '@/lib/data/demo-products'
import { useVaultStore } from '@/store/useVaultStore'

export default function VaultPage() {
  const ids = useVaultStore((state) => state.productIds)
  const products = useMemo(() => demoProducts.filter((product) => ids.includes(product._id)), [ids])
  return <main className="container-brand py-16 lg:py-24"><p className="text-label text-brand-accent">Your private edit</p><h1 className="mt-4 text-display-xl text-foreground">The Vault</h1><p className="mt-6 max-w-xl text-text-muted">Fragrances worth returning to, held here until the moment is right.</p>{products.length ? <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6"><>{products.map((product) => <ProductCard key={product._id} product={product} />)}</></div> : <div className="mt-16 border-y border-hairline py-20 text-center"><p className="font-display text-3xl text-foreground">Nothing saved yet.</p><Link href="/shop" className="mt-6 inline-flex border-b border-brand-accent pb-2 text-label text-brand-accent">Explore the collection</Link></div>}</main>
}
