import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Philosophy',
  description: 'Discover the quiet craft and Kannauj heritage behind Ummati fragrances.',
}

export default function AboutPage() {
  return (
    <div className="container-brand py-20 lg:py-32">
      <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28">
        <div>
          <p className="text-label mb-6 text-brand-accent">The atelier / 02</p>
          <h1 className="text-display-xl text-foreground">A slower kind of luxury.</h1>
        </div>
        <div className="max-w-2xl border-l border-hairline pl-6 text-base leading-[1.9] text-text-muted lg:pl-10">
          <p>Ummati began with a simple belief: fragrance should feel discovered, not declared.</p>
          <p className="mt-7">From the attar makers of Kannauj to modern compositions made for everyday rituals, we work patiently with materials that carry warmth, texture, and memory.</p>
          <p className="mt-7">Every study is blended in small batches and allowed to settle before it reaches your skin. The result is intimate, considered, and entirely your own.</p>
          <Link href="/shop" className="luxury-link mt-12 inline-flex items-center gap-3 text-label text-foreground transition-colors hover:text-brand-accent">
            Explore the collection <ArrowUpRight className="h-4 w-4" strokeWidth={1.2} />
          </Link>
        </div>
      </div>
      <div className="mt-24 grid gap-px border-y border-hairline bg-hairline sm:grid-cols-3">
        {[['01', 'Kannauj', 'Rooted in India’s attar tradition.'], ['02', 'Small batch', 'Blended slowly, never rushed.'], ['03', 'Close to skin', 'Made for the moments between.']].map(([number, title, copy]) => (
          <div key={number} className="bg-bg-base p-8 lg:p-12">
            <span className="text-label text-brand-accent">{number}</span>
            <h2 className="mt-16 font-display text-3xl text-foreground">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
