import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bagify.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  ]

  // Dynamic product pages
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url:             `${base}/products/${p.slug}`,
    lastModified:    new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  // Category pages (via shop filter)
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url:             `${base}/shop?category=${c.slug}`,
    lastModified:    new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
