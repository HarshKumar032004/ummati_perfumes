'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { uploadProductImage } from '@/lib/actions/upload.actions'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void
  initialUrls?: string[]
}

export function ImageUploader({ onUploadComplete, initialUrls = [] }: ImageUploaderProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialUrls)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)
    
    const newUrls: string[] = []

    try {
      // Process files sequentially or in parallel. Let's do sequentially for simplicity and stability.
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await uploadProductImage(formData)
        if (!result.success) {
          throw new Error(result.error || `Failed to upload ${file.name}`)
        }
        if (result.data) {
          newUrls.push(result.data)
        }
      }

      const updatedUrls = [...uploadedUrls, ...newUrls]
      setUploadedUrls(updatedUrls)
      onUploadComplete(updatedUrls)
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (urlToRemove: string) => {
    const updatedUrls = uploadedUrls.filter(url => url !== urlToRemove)
    setUploadedUrls(updatedUrls)
    onUploadComplete(updatedUrls)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-[#2A2530] rounded-xl p-8 text-center bg-[#0A090C] hover:bg-[#110F14] transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="mx-auto h-10 w-10 text-[#7A6B58] mb-4" />
        <p className="text-sm text-[#C0AE95] mb-2">
          Click to upload images or drag and drop
        </p>
        <p className="text-xs text-[#7A6B58]">
          SVG, PNG, JPG or GIF (max. 5MB)
        </p>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {error && <p className="text-sm text-[#E89A9A]">{error}</p>}

      {/* Uploading State */}
      {isUploading && (
        <div className="flex items-center gap-3 text-[#C8A96E] text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading images...
        </div>
      )}

      {/* Gallery */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {uploadedUrls.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-lg border border-[#2A2530] overflow-hidden bg-[#1A1820] group">
              <Image src={url} alt={`Upload ${idx + 1}`} fill className="object-cover" />
              <button 
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#C8A96E] text-[#09080B] text-[10px] font-bold text-center py-1 uppercase tracking-widest">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
