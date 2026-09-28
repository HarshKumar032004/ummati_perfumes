import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/actions/product.actions'
import { Hero3D } from '@/components/storefront/Hero3D'
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard'

export default async function Homepage() {
  const featuredProducts = await getFeaturedProducts(4)

  return (
    <div className="overflow-hidden">
      <section className="border-b border-hairline bg-bg-base">
        <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="container-brand flex flex-col justify-center py-20 lg:col-start-1 lg:py-28 lg:pr-12 xl:pr-24">
            <div className="max-w-xl">
              <p className="text-label mb-8 text-brand-accent">Parfum d&apos;exception · Est. 2024</p>
              <h1 className="text-display-2xl text-foreground">
                A memory,
                <br />
                <em className="text-brand-accent">made visible.</em>
              </h1>
              <p className="mt-10 max-w-md text-base leading-[1.8] text-text-muted lg:text-lg">
                Compositions for the considered life. Rare botanicals, patient maceration, and a quiet confidence that stays close to the skin.
              </p>
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Link href="/shop" className="group inline-flex items-center gap-4 border border-brand-accent bg-brand-accent px-6 py-4 text-label text-primary-foreground transition-colors duration-300 hover:bg-transparent hover:text-brand-accent">
                  Explore the collection
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.3} />
                </Link>
                <Link href="/about" className="luxury-link text-label text-text-muted transition-colors hover:text-brand-accent">Our philosophy</Link>
              </div>
            </div>
            <div className="mt-20 flex items-center gap-4 text-text-muted">
              <ArrowDownRight className="h-4 w-4 text-brand-accent" strokeWidth={1.2} />
              <span className="text-label">Scroll to enter the atelier</span>
            </div>
          </div>

          <div className="relative min-h-[31rem] border-t border-hairline lg:border-l lg:border-t-0">
            <Suspense fallback={<div className="h-full min-h-[31rem] bg-bg-surface" />}>
              <Hero3D />
            </Suspense>
            <div className="absolute right-5 top-5 hidden text-right sm:block">
              <p className="text-label text-text-muted">No. 01</p>
              <p className="mt-2 font-display text-xl font-light text-foreground">Sillage study</p>
            </div>
          </div>
        </div>
        <div className="container-brand grid grid-cols-2 border-t border-hairline py-8 sm:grid-cols-4">
          {[
            ['01', 'Kannauj attar'],
            ['02', 'Small-batch blend'],
            ['03', 'Made to linger'],
            ['04', 'India, always'],
          ].map(([number, label]) => (
            <div key={number} className="flex items-center gap-3 border-r border-hairline px-4 first:pl-0 last:border-0 sm:px-6">
              <span className="text-label text-brand-accent">{number}</span>
              <span className="text-xs text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-brand py-28 lg:py-40">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-label mb-5 text-brand-accent">The edit</p>
            <h2 className="text-display-lg text-foreground">Objects of desire.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-text-muted md:text-right">Four studies in atmosphere, composed for the moments you choose to keep.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-7">
          {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} priority={index < 4} />
          )) : Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
        <div className="mt-16 flex justify-center">
          <Link href="/shop" className="luxury-link inline-flex items-center gap-3 text-label text-text-muted transition-colors hover:text-brand-accent">
            View all fragrances <ArrowUpRight className="h-4 w-4" strokeWidth={1.2} />
          </Link>
        </div>
      </section>

      <section className="border-y border-hairline bg-bg-surface">
        <div className="container-brand grid items-center gap-16 py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-28 lg:py-40">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(200,169,110,0.28),transparent_32%),linear-gradient(145deg,transparent_20%,rgba(28,25,23,0.18))]" />
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[45%_45%_18%_18%] border border-brand-accent/35 bg-bg-surface/35 shadow-[0_35px_100px_rgba(0,0,0,0.18)]" />
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between border-t border-hairline pt-4">
              <span className="text-label text-text-muted">The atelier</span>
              <span className="font-display text-2xl italic text-brand-accent">001</span>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-label mb-7 text-brand-accent">A slower kind of luxury</p>
            <h2 className="text-display-xl text-foreground">The art of staying close.</h2>
            <div className="mt-10 space-y-6 text-base leading-[1.85] text-text-muted">
              <p>At Ummati, perfume is not an announcement. It is a private language between skin, air, and memory.</p>
              <p>We work with a restrained palette of precious materials, letting every note breathe before it finds its place in the final composition.</p>
            </div>
            <Link href="/about" className="luxury-link mt-12 inline-flex items-center gap-3 text-label text-foreground transition-colors hover:text-brand-accent">Enter the atelier <ArrowUpRight className="h-4 w-4" strokeWidth={1.2} /></Link>
          </div>
        </div>
      </section>

      <section className="container-brand py-28 lg:py-36">
        <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-label mb-5 text-brand-accent">A note from us</p>
            <p className="max-w-4xl font-display text-4xl font-light leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">“The best fragrance is the one that makes someone lean closer.”</p>
          </div>
          <span className="text-label text-text-muted">Ummati / 2024—∞</span>
        </div>
      </section>
    </div>
  )
}
