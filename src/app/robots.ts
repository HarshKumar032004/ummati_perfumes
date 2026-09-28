import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/shop', '/product/*'],
      disallow: ['/admin/', '/checkout/', '/order/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
