'use server'

import dbConnect from '@/lib/db/mongodb'
import { Order, IOrder } from '@/models/Order'

export async function getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
  try {
    await dbConnect()
    
    const order = await Order.findOne({ orderNumber }).lean()
    
    if (!order) return null

    // We can sanitize the order here if we want to hide certain fields,
    // but the model is already fairly safe since it doesn't store secrets
    // like webhook payloads directly.
    return JSON.parse(JSON.stringify(order)) // Serialize for Server Component boundary
  } catch (error) {
    console.error(`[ORDER] Error fetching order ${orderNumber}:`, error)
    return null
  }
}
