import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/features/admin/components/product-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'New product' }

export default async function AdminNewProductPage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
          aria-label="Back to products"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">New product</h1>
          <p className="text-sm text-muted-foreground">Add a new product to the store</p>
        </div>
      </div>

      <ProductForm categories={categories ?? []} mode="create" />
    </div>
  )
}
