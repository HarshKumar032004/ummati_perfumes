import React from 'react'
import Link from 'next/link'
import { getDashboardMetrics, getRecentOrders } from '@/lib/actions/admin.analytics.actions'
import { formatPrice } from '@/lib/utils/currency'
import { TrendingUp, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminDashboardPage() {
  const [metrics, recentOrders] = await Promise.all([
    getDashboardMetrics(),
    getRecentOrders(5)
  ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl text-[#F0E8D8]">Executive Dashboard</h1>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#7A6B58] uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-3xl font-display text-[#C8A96E]">{formatPrice(metrics.totalRevenue)}</p>
          </div>
          <div className="h-12 w-12 bg-[#C8A96E]/10 rounded-full flex items-center justify-center border border-[#C8A96E]/20">
            <TrendingUp className="h-6 w-6 text-[#C8A96E]" />
          </div>
        </div>

        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#7A6B58] uppercase tracking-wider mb-2">Total Orders</p>
            <p className="text-3xl font-display text-[#F0E8D8]">{metrics.totalOrders}</p>
          </div>
          <div className="h-12 w-12 bg-[#1A1820] rounded-full flex items-center justify-center border border-[#2A2530]">
            <ShoppingBag className="h-6 w-6 text-[#C0AE95]" />
          </div>
        </div>

        <div className="bg-[#110F14] border border-[#2A2530] p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#7A6B58] uppercase tracking-wider mb-2">Avg Order Value</p>
            <p className="text-3xl font-display text-[#F0E8D8]">{formatPrice(metrics.aov)}</p>
          </div>
          <div className="h-12 w-12 bg-[#1A1820] rounded-full flex items-center justify-center border border-[#2A2530]">
            <CreditCard className="h-6 w-6 text-[#C0AE95]" />
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="bg-[#110F14] border border-[#2A2530] rounded-xl overflow-hidden mt-4">
        <div className="p-6 border-b border-[#2A2530] flex items-center justify-between bg-[#0A090C]">
          <h2 className="font-display text-xl text-[#F0E8D8]">Recent Transactions</h2>
          <Link href="/admin/orders" className="text-sm text-[#C8A96E] flex items-center hover:text-[#E8C89A] transition-colors">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium text-[#C8A96E]">
                    <Link href={`/admin/orders/${order._id}`}>
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#F0E8D8]">{order.customer.name}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 bg-[#1A1820] border border-[#2A2530] rounded text-xs text-[#C0AE95]">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-[#F0E8D8]">
                    {formatPrice(order.totals.total)}
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[#7A6B58]">
                    No recent transactions.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  )
}
