import React from 'react'
import Link from 'next/link'
import { getAllOrders } from '@/lib/actions/admin.order.actions'
import { formatPrice } from '@/lib/utils/currency'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#F0E8D8]">Orders</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={String(order._id)}>
              <TableCell className="font-medium text-[#C8A96E]">
                <Link href={`/admin/orders/${order._id}`}>
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {order.customer.name}
                <div className="text-xs text-[#7A6B58]">{order.customer.email}</div>
              </TableCell>
              <TableCell className="capitalize">
                {order.payment.method} 
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${order.payment.status === 'paid' ? 'bg-[#3D6B4A]/20 text-[#9AE8A8]' : 'bg-[#6B5A3D]/20 text-[#E8C89A]'}`}>
                  {order.payment.status}
                </span>
              </TableCell>
              <TableCell>
                <span className="capitalize text-[#F0E8D8] px-2 py-1 bg-[#1A1820] rounded text-sm">
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium text-[#F0E8D8]">
                {formatPrice(order.totals.total)}
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[#7A6B58]">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
