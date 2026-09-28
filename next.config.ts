import type { NextConfig } from 'next'
// @ts-expect-error - Sentry types might be missing in this exact version
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // ─── Image Optimization ───────────────────────────────────────────────────
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',   // Cloudinary product images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',      // AWS S3 backup images
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
  },

  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /products → /shop
      {
        source: '/products',
        destination: '/shop',
        permanent: true,
      },
      // Redirect /collections → /shop
      {
        source: '/collections',
        destination: '/shop',
        permanent: true,
      },
    ]
  },

  // ─── Experimental ────────────────────────────────────────────────────────
  experimental: {
    // Server Actions are stable in Next.js 14+, no flag needed
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },

  // ─── Logging ─────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig;
