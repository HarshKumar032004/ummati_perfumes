import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Check, Star } from 'lucide-react'
import { Suspense } from 'react'
import { getFeaturedProducts } from '@/lib/actions/product.actions'
import { Hero3D } from '@/components/storefront/Hero3D'
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard'

export default async function Homepage() {
  const featuredProducts = await getFeaturedProducts(8)
  const heroProduct = featuredProducts[0]
  const editorialImage = featuredProducts[1]?.images.find((image) => image.isPrimary) ?? featuredProducts[1]?.images[0]

  return (
    <div className="overflow-hidden">
      <section className="border-b border-hairline bg-bg-base">
        <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-12">
          <div className="container-brand flex flex-col justify-center py-20 lg:col-span-6 lg:py-28 lg:pr-12 xl:pr-24">
            <div className="max-w-xl">
              <p className="text-label mb-8 text-brand-accent">Attars &amp; Eaux · Est. in Kannauj lineage</p>
              <h1 className="text-display-2xl text-foreground">The art of <em className="text-brand-accent">lingering.</em></h1>
              <p className="mt-10 max-w-md text-base leading-[1.8] text-text-muted lg:text-lg">Rare botanicals, patient maceration, and a quiet confidence that stays close to the skin.</p>
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Link href="/shop" className="group inline-flex items-center gap-4 border border-brand-accent bg-brand-accent px-6 py-4 text-label text-primary-foreground transition-colors duration-300 hover:bg-transparent hover:text-brand-accent">Explore the collection <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.3} /></Link>
                <Link href="/about" className="luxury-link text-label text-text-muted transition-colors hover:text-brand-accent">Discover our ateliers</Link>
              </div>
            </div>
            <div className="mt-20 flex items-center gap-4 text-text-muted"><span className="text-label">Scroll</span><span className="h-px w-16 bg-brand-accent" /><span className="sr-only">Scroll to continue</span></div>
          </div>
          <div className="relative min-h-[31rem] border-t border-hairline lg:col-span-6 lg:border-l lg:border-t-0">
            <Suspense fallback={<div className="h-full min-h-[31rem] bg-bg-surface" />}><Hero3D /></Suspense>
            <div className="absolute right-5 top-5 text-right"><p className="text-label text-text-muted">No. 07</p><p className="mt-2 font-display text-xl font-light text-foreground">Oud Kannauj</p></div>
          </div>
        </div>
      </section>

      <section className="container-brand py-24 lg:py-32">
        <p className="max-w-5xl font-display text-4xl font-light leading-[1.08] tracking-[-0.025em] text-foreground md:text-6xl">A perfume can be a place. <span className="text-brand-accent">Ours begin in Kannauj</span>, then travel quietly with you.</p>
        <div className="mt-20 grid grid-cols-2 border-y border-hairline md:grid-cols-4">
          {[['Kannauj attar heritage','01'],['Slow-distilled','02'],['Alcohol-free attars','03'],['Small-batch','04']].map(([label, number]) => <div key={label} className="border-r border-hairline px-5 py-7 last:border-0 md:px-7"><span className="text-label text-brand-accent">{number}</span><p className="mt-5 text-sm text-text-muted">{label}</p></div>)}
        </div>
      </section>

      <section className="container-brand py-24 lg:py-36">
        <div className="mb-14 flex items-end justify-between gap-8"><div><p className="text-label mb-5 text-brand-accent">The edit</p><h2 className="text-display-lg text-foreground">Objects of desire.</h2></div><Link href="/shop" className="luxury-link text-label text-text-muted hover:text-brand-accent">View all <ArrowUpRight className="ml-2 inline h-4 w-4" /></Link></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-7">{featuredProducts.length > 0 ? featuredProducts.slice(0,4).map((product,index) => <div key={product._id} className={index % 2 === 1 ? 'md:translate-y-8' : ''}><ProductCard product={product} priority={index < 4} /></div>) : Array.from({length:4}).map((_,index)=><ProductCardSkeleton key={index}/>)}</div>
      </section>

      <section className="border-y border-hairline bg-bg-surface"><div className="container-brand grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-24 lg:py-36"><div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">{editorialImage?.url && <img src={editorialImage.url} alt="Raw materials used in Ummati fragrance" className="h-full w-full object-cover grayscale-[20%] transition-transform duration-1000 hover:scale-[1.03]" />}<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" /><span className="absolute bottom-6 left-6 text-label text-white">Raw materials / Kannauj</span></div><div><p className="text-label mb-7 text-brand-accent">A slower kind of luxury</p><blockquote className="font-display text-5xl font-light italic leading-[1.05] text-foreground md:text-7xl">
