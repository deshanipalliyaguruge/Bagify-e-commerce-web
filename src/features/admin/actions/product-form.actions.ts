'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { z } from 'zod'
import type { AdminActionResult } from '@/features/admin/types/admin.types'

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const productFormSchema = z.object({
  name:              z.string().min(2).max(200),
  slug:              z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description:       z.string().max(5000).optional().or(z.literal('')),
  short_description: z.string().max(500).optional().or(z.literal('')),
  price:             z.coerce.number().int().min(1, 'Price must be at least 1 cent'),
  compare_at_price:  z.coerce.number().int().min(0).optional().nullable(),
  sku:               z.string().max(100).optional().or(z.literal('')),
  stock_quantity:    z.coerce.number().int().min(0),
  category_id:       z.string().uuid().optional().nullable(),
  is_active:         z.coerce.boolean().default(true),
  is_featured:       z.coerce.boolean().default(false),
  tags:              z.string().optional(),   // comma-separated, parsed below
  meta_title:        z.string().max(200).optional().or(z.literal('')),
  meta_description:  z.string().max(400).optional().or(z.literal('')),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// ─────────────────────────────────────────────────────────────────
// Create product
// ─────────────────────────────────────────────────────────────────

export async function createProductAction(
  formData: ProductFormValues,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  let data: ProductFormValues
  try {
    data = productFormSchema.parse(formData)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Validation failed'
    return { success: false, error: msg }
  }

  const { tags, compare_at_price, ...rest } = data
  const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      ...rest,
      tags: tagArray,
      compare_at_price: compare_at_price ?? null,
      sku: rest.sku || null,
      description: rest.description || null,
      short_description: rest.short_description || null,
      meta_title: rest.meta_title || null,
      meta_description: rest.meta_description || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  redirect(`/admin/products/${product.id}/edit`)
}

// ─────────────────────────────────────────────────────────────────
// Update product
// ─────────────────────────────────────────────────────────────────

export async function updateProductAction(
  productId: string,
  formData: ProductFormValues,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  let data: ProductFormValues
  try {
    data = productFormSchema.parse(formData)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Validation failed'
    return { success: false, error: msg }
  }

  const { tags, compare_at_price, ...rest } = data
  const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  const { error } = await supabase
    .from('products')
    .update({
      ...rest,
      tags: tagArray,
      compare_at_price: compare_at_price ?? null,
      sku: rest.sku || null,
      description: rest.description || null,
      short_description: rest.short_description || null,
      meta_title: rest.meta_title || null,
      meta_description: rest.meta_description || null,
    })
    .eq('id', productId)

  if (error) return { success: false, error: error.message }
  return { success: true, message: 'Product updated.' }
}
