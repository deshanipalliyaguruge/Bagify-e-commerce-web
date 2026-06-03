import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/config/app'
import type { ProductFilters, ProductListResult, ProductFull } from '@/features/products/types/product.types'
import type { Category } from '@/types/database'

// ─────────────────────────────────────────────────────────────────
// Products List
// ─────────────────────────────────────────────────────────────────

export async function getProducts(filters: ProductFilters): Promise<ProductListResult> {
  const supabase = await createClient()
  const pageSize = PAGINATION.defaultPageSize
  const from = (filters.page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select(
      `
      id, name, slug, price, compare_at_price, stock_quantity,
      is_featured, review_count, average_rating, tags, created_at,
      primary_image_path, primary_image_alt,
      categories ( id, name, slug )
      `,
      { count: 'exact' },
    )
    .eq('is_active', true)

  // ── Full-text search ──────────────────────────────────────────
  if (filters.q) {
    query = query.textSearch('fts', filters.q, {
      type: 'websearch',
      config: 'english',
    })
  }

  // ── Category filter ───────────────────────────────────────────
  if (filters.category) {
    query = query.eq('categories.slug', filters.category)
  }

  // ── Price range ───────────────────────────────────────────────
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice * 100) // Convert to cents
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice * 100)
  }

  // ── Sort ──────────────────────────────────────────────────────
  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('average_rating', { ascending: false, nullsFirst: false })
      break
    case 'popular':
      query = query.order('review_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // ── Pagination ────────────────────────────────────────────────
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('getProducts error:', error)
    return { products: [], total: 0, page: filters.page, pageSize, totalPages: 0 }
  }

  const total = count ?? 0

  return {
    products: (data ?? []) as unknown as ProductListResult['products'],
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// ─────────────────────────────────────────────────────────────────
// Single Product by Slug
// ─────────────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<ProductFull | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      categories ( * ),
      product_images ( * ),
      product_variants ( * )
      `,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as unknown as ProductFull
}

// ─────────────────────────────────────────────────────────────────
// Related Products
// ─────────────────────────────────────────────────────────────────

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      'id, name, slug, price, compare_at_price, review_count, average_rating, primary_image_path, primary_image_alt',
    )
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data } = await query
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────
// Slugs for generateStaticParams
// ─────────────────────────────────────────────────────────────────

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────

/**
 * Active categories — cached for 1 hour, tagged for on-demand revalidation.
 * Revalidate via: revalidateTag('categories')
 */
export const getActiveCategories = unstable_cache(
  async (): Promise<Category[]> => {
    // createPublicClient() — no cookies(), safe inside unstable_cache
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    return (data ?? []) as Category[]
  },
  ['active-categories'],
  { revalidate: 3600, tags: ['categories'] },
)

/**
 * Featured products — cached for 5 minutes, tagged for on-demand revalidation.
 * Revalidate via: revalidateTag('featured-products')
 */
export const getFeaturedProducts = unstable_cache(
  async (limit = 8) => {
    // createPublicClient() — no cookies(), safe inside unstable_cache
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, compare_at_price, review_count, average_rating, primary_image_path, primary_image_alt, is_featured',
      )
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data ?? []
  },
  ['featured-products'],
  { revalidate: 300, tags: ['featured-products'] },
)
