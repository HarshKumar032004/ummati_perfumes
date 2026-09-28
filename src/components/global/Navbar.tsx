'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetBody, SheetClose, SheetContent } from '@/components/ui/sheet'
import { useCartCount, useCartStore } from '@/store/useCartStore'
import { CartDrawer } from '@/components/storefront/CartDrawer'

const announcements = [
  'Complimentary shipping across India on orders above ₹1,999',
  'A considered study in scent, made in small batches',
  'Complimentary samples with every first order',
]

const navLinks = [
  { label: 'Collections', href: '/shop' },
  { label: 'The Ateliers', href: '/about' },
  { label: 'Notes Directory', href: '/shop?view=notes' },
]

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'luxury-link text-label transition-colors duration-300',
        active ? 'text-brand-accent' : 'text-text-muted hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false)

  const isDark = !mounted || resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to warm alabaster mode' : 'Switch to smoked obsidian mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Moon className="h-4 w-4" strokeWidth={1.4} /> : <Sun className="h-4 w-4" strokeWidth={1.4} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false)
  const openCart = useCartStore((state) => state.openCart)
  const cartCount = useCartCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!announcementVisible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setAnnouncementIndex((index) => (index + 1) % announcements.length), 6000)
    return () => window.clearInterval(timer)
  }, [announcementVisible])

  return (
    <>
      {announcementVisible && (
        <div
          className="group relative border-b border-hairline bg-bg-surface px-10 py-2 text-center sm:px-12"
          onMouseEnter={() => undefined}
          aria-live="polite"
        >
          <p className="text-label text-text-muted">{announcements[announcementIndex]}</p>
          <button type="button" aria-label="Dismiss announcement" onClick={() => setAnnouncementVisible(false)} className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-brand-accent">
            <X className="size-3.5" strokeWidth={1.2} />
          </button>
        </div>
      )}

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-40 w-full border-b border-hairline transition-colors duration-500',
          scrolled ? 'glass' : 'bg-bg-base/95',
        )}
      >
        <nav className="container-brand grid h-[4.25rem] grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-1 sm:h-[4.5rem] sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-2 lg:h-20 lg:flex">
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={pathname === link.href || pathname.startsWith('/shop') && link.href === '/shop'}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.4} />
          </button>

          <Link
            href="/"
            aria-label="Ummati Perfumes — Home"
            className="col-start-2 min-w-0 max-w-full justify-self-center truncate px-1 font-display text-[1.15rem] font-medium tracking-[0.14em] text-foreground transition-colors hover:text-brand-accent sm:text-[1.65rem] sm:tracking-[0.22em] lg:text-[2rem]"
          >
            UMMATI
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1">
            <button aria-label="Search" type="button" className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent">
              <Search className="h-[17px] w-[17px]" strokeWidth={1.4} />
            </button>
            <ThemeToggle />
            <Link href="/vault" aria-label="Open Vault" className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent"><Heart className="size-4" /></Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${mounted ? cartCount : 0} items`}
              className="relative ml-0 flex h-9 items-center gap-1.5 rounded-full border border-hairline px-2.5 text-text-muted transition-colors hover:border-brand-accent/50 hover:text-brand-accent sm:ml-1 sm:gap-2 sm:px-3"
            >
              <ShoppingBag className="h-[15px] w-[15px]" strokeWidth={1.4} />
              <span className="hidden text-label sm:inline">Bag</span>
              {mounted && cartCount > 0 && (
                <span className="font-sans text-[10px] text-brand-accent">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(88vw,380px)] bg-bg-base p-0" showClose={false}>
          <div className="flex items-center justify-between border-b border-hairline px-6 py-6">
            <span className="font-display text-2xl tracking-[0.2em] text-foreground">UMMATI</span>
            <SheetClose className="flex h-9 w-9 items-center justify-center text-text-muted hover:text-brand-accent">
              <X className="h-5 w-5" strokeWidth={1.3} />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>
          <SheetBody className="px-6 py-10">
            <p className="text-label mb-6 text-brand-accent">Explore Ummati</p>
            <nav className="flex flex-col gap-5">
              {[...navLinks, { label: 'Our Story', href: '/about' }, { label: 'FAQ', href: '/faq' }].map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl font-light tracking-tight text-foreground transition-colors hover:text-brand-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetBody>
          <div className="border-t border-hairline px-6 py-6">
            <p className="max-w-[16rem] text-sm leading-relaxed text-text-muted">A quiet study in scent, memory, and the rituals that make a fragrance yours.</p>
          </div>
        </SheetContent>
      </Sheet>

      <CartDrawer />
    </>
  )
}

export default Navbar
