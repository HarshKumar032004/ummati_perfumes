import type { Metadata, Viewport } from 'next'
import './globals.css'
import { siteConfig } from '@/lib/config/site'
import { Suspense } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CommandPalette, ScrollProgress } from '@/components/global/StorefrontInteractions'

// ─── Root Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'perfume', 'fragrance', 'attar', 'oud', 'premium perfume India',
    'buy perfume online', 'Ummati Perfumes', 'luxury fragrance',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Premium Fragrances`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0A09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <ScrollProgress />
          {children}
          <CommandPalette />
          <Suspense fallback={null}>
            <LoginModal />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
