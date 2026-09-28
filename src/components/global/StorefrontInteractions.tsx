'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Command, Heart, Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { useCartStore } from '@/store/useCartStore'
import { useVaultCount, useVaultStore } from '@/store/useVaultStore'
import { demoProducts } from '@/lib/data/demo-products'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => { const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? scrollY / max : 0) }; addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => removeEventListener('scroll', onScroll) }, [])
  return <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-brand-accent" style={{ transform: `scaleX(${progress})` }} />
}

export function CommandPalette() {
  const router = useRouter(); const pathname = usePathname(); const { setTheme, resolvedTheme } = useTheme(); const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const cartItems = useCartStore((s) => s.items); const vaultCount = useVaultCount()
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) } }; addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey) }, [])
  const products = useMemo(() => demoProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.fragranceFamily.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query])
  const go = (href: string) => { setOpen(false); setQuery(''); router.push(href) }
  if (pathname.startsWith('/admin')) return null
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Open command palette, Control K" className="sr-only">Open search</button>
    <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/45 px-4 pt-[14vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setOpen(false)}>
      <motion.div role="dialog" aria-modal="true" aria-label="Search Ummati" className="w-full max-w-xl border border-hairline bg-bg-base shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-hairline px-5"><Search className="size-4 text-brand-accent" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the collection…" className="h-14 flex-1 bg-transparent font-display text-lg text-foreground outline-none placeholder:text-text-muted" /><kbd className="text-label text-text-muted">ESC</kbd><button type="button" aria-label="Close search" onClick={() => setOpen(false)}><X className="size-4 text-text-muted" /></button></div>
        <div className="p-3"><p className="text-label px-3 py-2 text-brand-accent">Navigate</p><div className="grid gap-1">{[['/shop','The collection'],['/about','The ateliers'],['/vault',`Your vault (${vaultCount})`],...(cartItems.length ? [['/checkout','Checkout']] : [])].map(([href, label]) => <button key={href} type="button" onClick={() => go(href)} className="flex items-center justify-between px-3 py-3 text-left text-sm text-text-secondary hover:bg-bg-surface hover:text-brand-accent"><span>{label}</span><Command className="size-3 opacity-40" /></button>)}</div><p className="mt-3 border-t border-hairline px-3 pt-4 text-label text-brand-accent">Fragrances</p>{products.map((p) => <button key={p._id} type="button" onClick={() => go(`/product/${p.slug}`)} className="block w-full px-3 py-3 text-left font-display text-lg text-foreground hover:bg-bg-surface hover:text-brand-accent">{p.name}<span className="ml-2 text-xs text-text-muted">{p.fragranceFamily}</span></button>)}<button type="button" onClick={() => { setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); setOpen(false) }} className="mt-2 w-full border-t border-hairline px-3 pt-4 text-left text-sm text-text-muted hover:text-brand-accent">Toggle {resolvedTheme === 'dark' ? 'alabaster' : 'obsidian'} mode</button></div>
      </motion.div>
    </motion.div>}</AnimatePresence>
  </>
}

export function VaultButton({ productId, label = false }: { productId: string; label?: boolean }) {
  const saved = useVaultStore((state) => state.productIds.includes(productId))
  const storeToggle = useVaultStore((state) => state.toggle)
  const reduced = useReducedMotion()
  return <button type="button" aria-pressed={saved} onClick={() => storeToggle(productId)} className="group inline-flex items-center gap-2 text-label text-text-muted transition-colors hover:text-brand-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-brand-accent"> <motion.span animate={saved ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: reduced ? 0 : 0.4 }}><Heart className="size-4" fill={saved ? 'currentColor' : 'none'} /></motion.span>{label && (saved ? 'Saved to Vault' : 'Save to Vault')}</button>
}
