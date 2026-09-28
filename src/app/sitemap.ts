import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db/mongodb'
import { Product } from '@/models/Product'
import { siteConfig } from '@/lib/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Connect to DB and fetch active product slugs
  await dbConnect()
  const products = await Product.find({ isActive: true }).select('slug updatedAt').lean()

  // Base URLs
  const routes = ['', '/shop'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic Product URLs
  const productUrls = products.map((product) => ({
    url: `${siteConfig.url}/product/${product.slug}`,
    lastModified: (product as any).updatedAt ? new Date((product as any).updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...productUrls]
}
