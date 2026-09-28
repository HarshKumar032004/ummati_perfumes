import type { Metadata } from 'next'
import { Navbar } from '@/components/global/Navbar'
import { Footer } from '@/components/global/Footer'

export const metadata: Metadata = {
  // Page-level metadata is set per-page via generateMetadata
  // This layout-level metadata is the fallback
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
