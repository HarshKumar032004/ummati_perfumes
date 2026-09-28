import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getProductBySlug } from '@/lib/actions/product.actions'
import { ProductGallery } from '@/components/storefront/ProductGallery'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { FragranceNotes } from '@/components/storefront/FragranceNotes'
import { siteConfig } from '@/lib/config/site'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface PDPProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PDPProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  const primaryImage = product.images.find((image) => image.isPrimary) || product.images[0]
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `${siteConfig.url}/product/${product.slug}`,
      siteName: siteConfig.name,
      images: primaryImage ? [{ url: primaryImage.url }] : [],
      locale: 'en_IN',
      type: 'website',
    },
  }
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const defaultVariant = product.variants.find((variant) => variant.isDefault) || product.variants[0]
  const primaryImage = product.images.find((image) => image.isPrimary) || product.images[0]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage ? [primaryImage.url] : [],
    description: product.shortDescription,
    sku: defaultVariant?.sku || '',
    brand: { '@type': 'Brand', name: 'Ummati Perfumes' },
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: (product.basePrice / 100).toFixed(2),
      availability: (defaultVariant?.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-brand py-8 lg:py-16">
        <nav className="mb-12 flex items-center gap-3 text-label text-text-muted" aria-label="Breadcrumb">
          <Link href="/shop" className="transition-colors hover:text-brand-accent">Collection</Link>
          <span className="text-brand-accent">/</span>
          <span className="truncate text-text-secondary">{product.name}</span>
        </nav>

        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-24">
          <ProductGallery images={product.images} />

          <div className="lg:sticky lg:top-32">
            <p className="text-label mb-5 text-brand-accent">{product.fragranceFamily} · Extrait de parfum</p>
            <h1 className="text-display-xl text-foreground">{product.name}</h1>
            <p className="mt-7 max-w-lg text-base leading-[1.8] text-text-muted">{product.shortDescription}</p>
            <AddToCartForm product={product} />

            <FragranceNotes topNotes={product.topNotes} middleNotes={product.middleNotes} baseNotes={product.baseNotes} />

            <div className="mt-16 border-t border-hairline">
              <Accordion type="multiple" className="w-full" defaultValue={['description']}>
                <AccordionItem value="description">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>
                    <p className="max-w-xl leading-[1.8] text-text-muted">{product.description}</p>
                    {product.ingredients && <p className="mt-5 text-xs leading-relaxed text-text-muted"><span className="text-text-secondary">Ingredients:</span> {product.ingredients}</p>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="performance">
                  <AccordionTrigger>Performance</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-y-4 text-sm">
                      <dt className="text-text-muted">Longevity</dt><dd className="text-right text-text-secondary">{product.longevity}</dd>
                      <dt className="text-text-muted">Sillage</dt><dd className="text-right text-text-secondary">{product.sillage}</dd>
                    </dl>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping & returns</AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-[1.8] text-text-muted">Complimentary shipping over ₹999. Orders leave our atelier within 1–2 business days. For hygiene reasons, opened fragrances cannot be returned. <Link href="/return-policy" className="text-brand-accent underline-offset-4 hover:underline">Read the full policy <ArrowUpRight className="inline h-3 w-3" /></Link></p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Link href="/shop" className="mt-10 inline-flex items-center gap-3 text-label text-text-muted transition-colors hover:text-brand-accent"><ArrowLeft className="h-4 w-4" strokeWidth={1.2} /> Back to collection</Link>
          </div>
        </div>
      </div>
    </>
  )
}
