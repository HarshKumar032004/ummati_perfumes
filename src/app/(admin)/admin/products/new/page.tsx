'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createProduct } from '@/lib/actions/admin.product.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'

export default function NewProductPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    
    // Parse arrays/numbers properly before sending to action
    const payload = {
      ...data,
      basePrice: parseInt(data.basePrice),
      compareAtPrice: data.compareAtPrice ? parseInt(data.compareAtPrice) : undefined,
      stock: parseInt(data.stock),
      topNotes: data.topNotes ? data.topNotes.split(',').map((s: string) => s.trim()) : [],
      middleNotes: data.middleNotes ? data.middleNotes.split(',').map((s: string) => s.trim()) : [],
      baseNotes: data.baseNotes ? data.baseNotes.split(',').map((s: string) => s.trim()) : [],
      isActive: data.isActive === 'true',
      rawImages: uploadedImages.join(','), // Re-use the existing logic in the action which splits by comma
    }

    const result = await createProduct(payload)

    if (result.success) {
      router.push('/admin/products')
    } else {
      setError(result.error || 'Failed to create product')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-[#C0AE95] hover:text-[#F0E8D8]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl text-[#F0E8D8]">Create Product</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#6B3D3D]/20 border border-[#6B3D3D] rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#E89A9A] shrink-0 mt-0.5" />
          <p className="text-[#E89A9A] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-medium text-[#F0E8D8] mb-4">Basic Information</h2>
          
          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Product Name</label>
            <Input {...register('name', { required: true })} placeholder="e.g. Oud Al Lail" />
          </div>

          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Short Description</label>
            <Input {...register('shortDescription')} placeholder="A brief teaser" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#C0AE95] mb-2">Base Price (Paise)</label>
              <Input type="number" {...register('basePrice', { required: true })} placeholder="199900" />
            </div>
            <div>
              <label className="block text-sm text-[#C0AE95] mb-2">Compare At Price</label>
              <Input type="number" {...register('compareAtPrice')} placeholder="249900" />
            </div>
          </div>
        </div>

        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-medium text-[#F0E8D8] mb-4">Fragrance Profile</h2>
          
          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Fragrance Family</label>
            <Input {...register('fragranceFamily')} placeholder="e.g. Oriental Woody" />
          </div>

          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Top Notes (comma separated)</label>
            <Input {...register('topNotes')} placeholder="Saffron, Rose" />
          </div>

          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Middle Notes (comma separated)</label>
            <Input {...register('middleNotes')} placeholder="Oud, Sandalwood" />
          </div>

          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Base Notes (comma separated)</label>
            <Input {...register('baseNotes')} placeholder="Amber, Vanilla" />
          </div>
        </div>

        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-medium text-[#F0E8D8] mb-4">Inventory & Media</h2>
          
          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Product Images</label>
            <ImageUploader onUploadComplete={(urls) => setUploadedImages(urls)} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm text-[#C0AE95] mb-2">Initial Stock</label>
              <Input type="number" {...register('stock', { required: true })} defaultValue="10" />
            </div>
            <div>
              <label className="block text-sm text-[#C0AE95] mb-2">Status</label>
              <select 
                {...register('isActive')} 
                className="flex h-10 w-full rounded-md border border-[#2A2530] bg-[#0A090C] px-3 py-2 text-sm text-[#F0E8D8] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#4A4035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="true">Active</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <Button type="submit" variant="premium" className="w-full" loading={isSubmitting}>
          Create Product
        </Button>
      </form>
    </div>
  )
}
