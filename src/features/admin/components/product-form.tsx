'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { createProductAction, updateProductAction } from '@/features/admin/actions/product-form.actions'
import type { ProductFormValues } from '@/features/admin/actions/product-form.actions'
import type { Category, Product } from '@/types/database'

type CategoryOption = Pick<Category, 'id' | 'name' | 'slug'>
const formSchema = z.object({
  name:              z.string().min(2, 'Name is required').max(200),
  slug:              z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  description:       z.string().max(5000).optional().or(z.literal('')),
  short_description: z.string().max(500).optional().or(z.literal('')),
  price:             z.coerce.number().int().min(1, 'Enter price in cents (e.g. 2999 = $29.99)'),
  compare_at_price:  z.coerce.number().int().min(0).optional().nullable(),
  sku:               z.string().max(100).optional().or(z.literal('')),
  stock_quantity:    z.coerce.number().int().min(0),
  category_id:       z.string().uuid().optional().nullable(),
  is_active:         z.coerce.boolean().default(true),
  is_featured:       z.coerce.boolean().default(false),
  tags:              z.string().optional(),
  meta_title:        z.string().max(200).optional().or(z.literal('')),
  meta_description:  z.string().max(400).optional().or(z.literal('')),
})


interface ProductFormProps {
  product?: Product | null
  categories: CategoryOption[]
  mode: 'create' | 'edit'
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name:              product?.name ?? '',
      slug:              product?.slug ?? '',
      description:       product?.description ?? '',
      short_description: product?.short_description ?? '',
      price:             product?.price ?? 0,
      compare_at_price:  product?.compare_at_price ?? null,
      sku:               product?.sku ?? '',
      stock_quantity:    product?.stock_quantity ?? 0,
      category_id:       product?.category_id ?? null,
      is_active:         product?.is_active ?? true,
      is_featured:       product?.is_featured ?? false,
      tags:              product?.tags?.join(', ') ?? '',
      meta_title:        product?.meta_title ?? '',
      meta_description:  product?.meta_description ?? '',
    },
  })

  // Auto-generate slug from name in create mode
  function handleNameChange(value: string) {
    if (mode === 'create') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      form.setValue('slug', slug)
    }
  }

  function onSubmit(values: ProductFormValues) {
    setServerError(null)
    setSuccessMsg(null)
    startTransition(async () => {
      if (mode === 'create') {
        await createProductAction(values)
        // createProductAction redirects on success
      } else if (product?.id) {
        const result = await updateProductAction(product.id, values)
        if (!result.success) setServerError(result.error)
        else setSuccessMsg(result.message)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {successMsg && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {/* ── Core info ── */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Product information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => { field.onChange(e); handleNameChange(e.target.value) }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="slug"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Slug *</FormLabel>
                  <FormControl><Input {...field} placeholder="my-product-name" /></FormControl>
                  <FormDescription className="text-xs">URL-friendly identifier. Auto-generated from name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="short_description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Short description</FormLabel>
                  <FormControl>
                    <textarea {...field} rows={2}
                      className="flex min-h-[64px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full description</FormLabel>
                  <FormControl>
                    <textarea {...field} rows={6}
                      className="flex min-h-[140px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ── Pricing & inventory ── */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Pricing & inventory</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FormField control={form.control} name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (cents) *</FormLabel>
                  <FormControl><Input {...field} type="number" min={1} /></FormControl>
                  <FormDescription className="text-xs">$29.99 = 2999</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="compare_at_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compare price (cents)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock qty</FormLabel>
                  <FormControl><Input {...field} type="number" min={0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input {...field} placeholder="BAG-001" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ── Organisation ── */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Organisation</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl><Input {...field} placeholder="leather, tote, sale" /></FormControl>
                  <FormDescription className="text-xs">Comma-separated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <FormField control={form.control} name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input type="checkbox" checked={!!field.value} onChange={field.onChange}
                      className="h-4 w-4 rounded border-input accent-primary" id="is-active" />
                  </FormControl>
                  <FormLabel htmlFor="is-active" className="cursor-pointer font-normal">Active (visible in store)</FormLabel>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input type="checkbox" checked={!!field.value} onChange={field.onChange}
                      className="h-4 w-4 rounded border-input accent-primary" id="is-featured" />
                  </FormControl>
                  <FormLabel htmlFor="is-featured" className="cursor-pointer font-normal">Featured on homepage</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ── SEO ── */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">SEO</h2>
          <div className="space-y-3">
            <FormField control={form.control} name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl><Input {...field} placeholder="Leave blank to use product name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <textarea {...field} rows={3}
                      className="flex min-h-[72px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg" className="gap-2 min-w-[140px]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
