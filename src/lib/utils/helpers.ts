/**
 * Slug and URL utility helpers.
 */

/**
 * Converts a string to a URL-safe slug.
 * @example slugify('Hello World!') => 'hello-world'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Builds a Supabase storage public URL for a given bucket and path.
 */
export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Returns a safe fallback image URL.
 */
export function getImageUrl(path: string | null | undefined, fallback = '/images/placeholder.png'): string {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  return getStorageUrl(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'bagify-products', path)
}
