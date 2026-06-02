import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/features/admin/components/product-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PageProps = { params: Promise<{ productId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name').eq('id', productId).single()
  return { title: data ? `Edit: ${data.name}` : 'Edit product' }
}

export default async function AdminEditProductPage({ params }: PageProps) {
  await requireAdmin()
  const { productId } = await params

  const supabase = await createClient()
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', productId).single(),
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
          aria-label="Back to products"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit product</h1>
          <p className="text-sm text-muted-foreground truncate max-w-xs">{product.name}</p>
        </div>
      </div>

      <ProductForm product={product} categories={categories ?? []} mode="edit" />
    </div>
  )
}
