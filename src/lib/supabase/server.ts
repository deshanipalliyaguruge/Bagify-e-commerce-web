import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes cookies via Next.js cookies() API to maintain auth session.
 *
 * ⚠️  Cannot be used inside unstable_cache() — cookies() is a dynamic data source.
 *     Use createPublicClient() instead for cached public queries.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookies will be set by middleware
          }
        },
      },
    },
  )
}

/**
 * Cookie-free Supabase client — safe to use inside unstable_cache().
 *
 * Uses the anon key so RLS policies still apply.
 * Only suitable for public, non-user-specific queries (categories, featured products, etc.).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
