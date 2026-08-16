'use client'

import { usePathname } from 'next/navigation'
import { StorefrontHeader } from '@/components/storefront-header'
import { StorefrontFooter } from '@/components/storefront-footer'

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hasDedicatedLayout = pathname.startsWith('/admin') || pathname.startsWith('/auth')

  if (hasDedicatedLayout) return children

  return (
    <>
      <StorefrontHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <StorefrontFooter />
    </>
  )
}
