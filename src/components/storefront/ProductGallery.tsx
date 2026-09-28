'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface ProductGalleryProps {
  images: { url: string; alt: string }[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const allImages = images.length > 0 ? images : [{ url: '', alt: 'No image available' }]
  const currentImage = allImages[currentIndex]
  const [lightboxOpen, setLightboxOpen] = useState(false)

  function move(delta: number) {
    setCurrentIndex((index) => (index + delta + allImages.length) % allImages.length)
  }

  return (
    <div className="lg:sticky lg:top-32">
      <div className="group relative aspect-[4/5] overflow-hidden bg-bg-surface">
        <button type="button" onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center border border-white/30 bg-black/20 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label="Open image gallery">
          <ZoomIn className="size-4" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
            {currentImage.url ? <Image src={currentImage.url} alt={currentImage.alt} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" /> : <div className="flex h-full items-center justify-center font-display text-2xl italic text-text-muted">No image</div>}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-5 left-5 text-label text-white/70">{String(currentIndex + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}</div>
      </div>

      {allImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button key={`${image.url}-${index}`} type="button" onClick={() => setCurrentIndex(index)} aria-label={`View image ${index + 1}`} className={cn('relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-bg-surface transition-all duration-300 sm:w-24', currentIndex === index ? 'opacity-100 ring-1 ring-brand-accent ring-offset-2 ring-offset-bg-base' : 'opacity-45 hover:opacity-90')}>
              {image.url && <Image src={image.url} alt={image.alt || `Thumbnail ${index + 1}`} fill sizes="96px" className="object-cover" />}
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-hairline bg-bg-base p-3 sm:p-5">
          <DialogTitle className="sr-only">{currentImage.alt}</DialogTitle>
          <div className="relative aspect-[4/5] max-h-[80vh] w-full overflow-hidden bg-bg-surface sm:aspect-video">
            {currentImage.url && <Image src={currentImage.url} alt={currentImage.alt} fill sizes="90vw" className="object-contain" />}
            {allImages.length > 1 && (
              <>
                <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white" aria-label="Previous image"><ChevronLeft className="size-5" /></button>
                <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white" aria-label="Next image"><ChevronRight className="size-5" /></button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
