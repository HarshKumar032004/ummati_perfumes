import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { getAllAdminProducts } from '@/lib/actions/admin.product.actions'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminProductsPage() {
  const products = await getAllAdminProducts()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#F0E8D8]">Products</h1>
        <Button variant="premium" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock (Default)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product: any) => {
            const primaryImage = product.images.find((img: any) => img.isPrimary) || product.images[0]
            const defaultVariant = product.variants.find((v: any) => v.isDefault) || product.variants[0]
            
            return (
              <TableRow key={product._id}>
                <TableCell>
                  <div className="relative h-12 w-10 bg-[#1A1820] rounded border border-[#2A2530] overflow-hidden">
                    {primaryImage && (
                      <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-[#F0E8D8]">{product.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-[#C8A96E]/20 text-[#C8A96E]' : 'bg-[#2A2530] text-[#7A6B58]'
                  }`}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>{formatPrice(product.basePrice)}</TableCell>
                <TableCell>{defaultVariant ? defaultVariant.stock : 'N/A'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
