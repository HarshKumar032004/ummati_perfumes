'use client'

import Link from 'next/link'
import { AtSign, Globe, Mail, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

const columns = [
  {
    title: 'Collection',
    links: [
      ['Shop all', '/shop'], ['Women', '/shop?category=women'], ['Men', '/shop?category=men'], ['Unisex', '/shop?category=unisex'], ['Attar', '/shop?category=attar'],
    ],
  },
  {
    title: 'Concierge',
    links: [
      ['Contact us', '/contact'], ['Shipping', '/shipping-policy'], ['Returns', '/return-policy'], ['Track order', '/track-order'], ['FAQ', '/faq'],
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline bg-bg-surface">
      <div className="container-brand py-14 sm:py-20 lg:py-28">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <p className="text-label text-brand-accent">The Ummati journal</p>
          <h2 className="mt-4 max-w-[18ch] font-display text-3xl font-light leading-[1.05] tracking-tight text-foreground sm:text-5xl">Scent, memory, and the rituals that make a fragrance yours.</h2>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-[1.6fr_0.7fr_0.7fr_1fr] lg:gap-10">
          <div>
            <Link href="/" className="font-display text-3xl tracking-[0.2em] text-foreground transition-colors hover:text-brand-accent">UMMATI</Link>
            <p className="mt-6 max-w-sm text-sm leading-[1.8] text-text-muted">A quiet study in scent, memory, and the rituals that make a fragrance yours.</p>
            <div className="mt-8 space-y-3 text-sm text-text-muted">
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 transition-colors hover:text-brand-accent"><Mail className="h-4 w-4 text-brand-accent" strokeWidth={1.2} />{siteConfig.email}</a>
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-3 transition-colors hover:text-brand-accent"><Phone className="h-4 w-4 text-brand-accent" strokeWidth={1.2} />{siteConfig.phone}</a>
            </div>
            <div className="mt-8 flex items-center gap-2">
              {[['Instagram', siteConfig.social.instagram, AtSign], ['Facebook', siteConfig.social.facebook, Globe]].map(([label, href, Icon]) => {
                const SocialIcon = Icon as typeof AtSign
                return <a key={label as string} href={href as string} target="_blank" rel="noopener noreferrer" aria-label={label as string} className="flex h-9 w-9 items-center justify-center border border-hairline text-text-muted transition-colors hover:border-brand-accent hover:text-brand-accent"><SocialIcon className="h-4 w-4" strokeWidth={1.2} /></a>
              })}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-label mb-6 text-brand-accent">{column.title}</p>
              <ul className="space-y-4">
                {column.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-text-muted transition-colors hover:text-foreground">{label}</Link></li>)}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-label mb-5 text-brand-accent">A note from the atelier</p>
            <p className="text-sm leading-[1.8] text-text-muted">New compositions, quiet rituals, and early access to our next study.</p>
            <form className="mt-6 flex border-b border-hairline" onSubmit={(event) => event.preventDefault()}>
              <input type="email" required placeholder="Your email" aria-label="Email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-text-muted" />
              <button type="submit" className="px-2 text-label text-brand-accent transition-colors hover:text-foreground">Join</button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="container-brand flex flex-col gap-3 py-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy-policy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div>
          <p className="text-brand-accent sm:text-right">Made in India · Worn everywhere</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
