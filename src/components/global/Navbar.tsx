'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetBody, SheetClose, SheetContent } from '@/components/ui/sheet'
import { useCartCount, useCartStore } from '@/store/useCartStore'
import { CartDrawer } from '@/components/storefront/CartDrawer'

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
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false)
  const openCart = useCartStore((state) => state.openCart)
  const cartCount = useCartCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="border-b border-hairline bg-bg-surface px-4 py-2 text-center">
        <p className="text-label text-text-muted">Complimentary delivery across India on orders over ₹999</p>
      </div>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-40 w-full border-b border-hairline transition-colors duration-500',
          scrolled ? 'glass' : 'bg-bg-base/95',
        )}
      >
        <nav className="container-brand relative flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
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
            className="absolute left-1/2 -translate-x-1/2 font-display text-[1.65rem] font-medium tracking-[0.22em] text-foreground transition-colors hover:text-brand-accent lg:text-[2rem]"
          >
            UMMATI
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button aria-label="Search" type="button" className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:text-brand-accent">
              <Search className="h-[17px] w-[17px]" strokeWidth={1.4} />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${mounted ? cartCount : 0} items`}
              className="relative ml-1 flex h-9 items-center gap-2 rounded-full border border-hairline px-3 text-text-muted transition-colors hover:border-brand-accent/50 hover:text-brand-accent"
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
