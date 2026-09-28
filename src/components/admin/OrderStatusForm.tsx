'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/lib/actions/admin.order.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'

interface OrderStatusFormProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [awb, setAwb] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleUpdate = async () => {
    setIsSubmitting(true)
    setError(null)
    
    const result = await updateOrderStatus(orderId, status, awb)
    
    if (!result.success) {
      setError(result.error || 'Failed to update status')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="bg-[#110F14] border border-[#2A2530] rounded-xl p-6">
      <h2 className="font-display text-xl text-[#F0E8D8] mb-4">Update Status</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-[#6B3D3D]/20 border border-[#6B3D3D] rounded flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-[#E89A9A] shrink-0 mt-0.5" />
          <p className="text-[#E89A9A] text-xs">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[#C0AE95] mb-2">Order Status</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[#2A2530] bg-[#0A090C] px-3 py-2 text-sm text-[#F0E8D8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96E]"
          >
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {status === 'shipped' && (
          <div>
            <label className="block text-sm text-[#C0AE95] mb-2">Tracking AWB (Optional)</label>
            <Input 
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. 1234567890" 
            />
          </div>
        )}

        <Button 
          variant="premium" 
          onClick={handleUpdate} 
          loading={isSubmitting}
          disabled={status === currentStatus && status !== 'shipped'}
          className="w-full mt-2"
        >
          Update Order
        </Button>
      </div>
    </div>
  )
}
