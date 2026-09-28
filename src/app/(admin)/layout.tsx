import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { LogOut, Package, ShoppingCart, LayoutDashboard, Menu, Users, Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/?login=true')

  type NavLink = { name: string; href: string; icon: typeof LayoutDashboard; disabled?: boolean }
  const navGroups: { label: string; links: NavLink[] }[] = [
    { label: 'Workspace', links: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    ]},
    { label: 'Coming soon', links: [
      { name: 'Customers', href: '#', icon: Users, disabled: true },
      { name: 'Settings', href: '#', icon: Settings, disabled: true },
    ]},
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r border-[#2A2530] bg-[#0A090C]">
      <div className="border-b border-[#2A2530] p-6">
        <Link href="/admin" className="font-display text-xl tracking-[0.22em] text-[#F0E8D8]">UMMATI<span className="ml-2 text-[10px] tracking-[0.16em] text-[#C8A96E]">ADMIN</span></Link>
      </div>
      <nav className="flex-1 space-y-7 p-4" aria-label="Admin navigation">
        {navGroups.map((group) => <div key={group.label} className="space-y-2"><p className="px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7A6B58]">{group.label}</p>{group.links.map((link) => { const Icon = link.icon; return <Link key={link.name} href={link.href} aria-disabled={link.disabled} className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-colors ${link.disabled ? 'pointer-events-none border-transparent text-[#514A52]' : 'border-transparent text-[#C0AE95] hover:border-[#C8A96E] hover:bg-[#1A1820] hover:text-[#F0E8D8]'}`}><Icon className="size-4" />{link.name}{link.disabled && <span className="ml-auto text-[9px] uppercase tracking-wider">Soon</span>}</Link> })}</div>)}
      </nav>
      <div className="border-t border-[#2A2530] p-4"><button className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-[#C0AE95] transition-colors hover:text-[#E89A9A]"><LogOut className="size-4" />Logout</button></div>
    </div>
  )

  return <div className="min-h-screen bg-[#110F14] text-[#F0E8D8]"><aside className="fixed inset-y-0 z-20 hidden w-64 md:flex"><SidebarContent /></aside><div className="flex min-h-screen flex-col md:pl-64"><header className="flex min-h-16 items-center justify-between border-b border-[#2A2530] bg-[#0A090C] px-4 md:hidden"><span className="font-display tracking-[0.18em]">UMMATI <span className="text-[#C8A96E]">ADMIN</span></span><Sheet><SheetTrigger asChild><button className="flex size-11 items-center justify-center text-[#C0AE95]" aria-label="Open admin navigation"><Menu className="size-5" /></button></SheetTrigger><SheetContent side="left" className="w-64 bg-[#0A090C] p-0"><SidebarContent /></SheetContent></Sheet></header><main className="flex-1 p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-[1560px]">{children}</div></main></div></div>
}
