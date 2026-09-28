'use server'

import { getSession } from '@/lib/auth/session'
import { uploadImageToCloudinary } from '@/lib/services/cloudinary'
import type { ActionResult } from '@/types'

export async function uploadProductImage(formData: FormData): Promise<ActionResult<string>> {
  try {
    // 1. Security Check
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Unauthorized to upload files.' }
    }

    // 2. Extract File
    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'No file provided.' }
    }

    // 3. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 4. Upload
    const secureUrl = await uploadImageToCloudinary(buffer, 'ummati_products')

    return { success: true, data: secureUrl }
  } catch (error: any) {
    console.error('[UPLOAD ACTION] Error:', error)
    return { success: false, error: error.message || 'Image upload failed.' }
  }
}
