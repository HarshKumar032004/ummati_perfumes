'use server'

import dbConnect from '@/lib/db/mongodb'
import { Order } from '@/models/Order'
import { getSession } from '@/lib/auth/session'

async function verifyAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized Action')
  }
}

export async function getDashboardMetrics() {
  try {
    await verifyAdmin()
    await dbConnect()

    const pipeline = [
      {
        $match: {
          status: { $nin: ['cancelled', 'failed', 'returned'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totals.total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]

    const result = await Order.aggregate(pipeline)
    
    if (result.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, aov: 0 }
    }

    const metrics = result[0]
    return {
      totalRevenue: metrics.totalRevenue,
      totalOrders: metrics.totalOrders,
      aov: metrics.totalOrders > 0 ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0
    }
  } catch (error) {
    console.error('[ANALYTICS] Get Metrics Error:', error)
    return { totalRevenue: 0, totalOrders: 0, aov: 0 }
  }
}

export async function getRecentOrders(limit = 5) {
  try {
    await verifyAdmin()
    await dbConnect()

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber customer.name totals.total status createdAt payment.method')
      .lean()

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error('[ANALYTICS] Get Recent Orders Error:', error)
    return []
  }
}
