import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { LogOut, Package, ShoppingCart, LayoutDashboard, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetBody } from '@/components/ui/sheet'

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Security Guard
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/?login=true')
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0A090C] border-r border-[#1F1C23]">
      <div className="p-6 border-b border-[#1F1C23]">
        <Link href="/admin" className="font-display text-xl tracking-widest text-[#F0E8D8]">
          UMMATI<span className="text-[#8A7148] ml-2 text-xs">ADMIN</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-[#C0AE95] hover:bg-[#1A1820] hover:text-[#F0E8D8] transition-colors"
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-[#1F1C23]">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-[#E89A9A] hover:bg-[#1A1820]/50 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#110F14] text-[#F0E8D8]">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <SidebarContent />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 md:pl-64">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#1F1C23] md:hidden bg-[#0A090C]">
          <span className="font-display tracking-widest text-lg">UMMATI ADMIN</span>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 -mr-2 text-[#C0AE95]">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-[#0A090C]" showClose={false}>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
