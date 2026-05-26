/**
 * Server-side auth helpers.
 * Use in Server Components, Server Actions, and Route Handlers.
 * NEVER import this in Client Components.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/config/app'
import type { Profile } from '@/types/database'

/**
 * Returns the current authenticated user and their DB profile.
 * Returns null for both if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as Profile | null }
}

/**
 * Requires an authenticated user.
 * Redirects to /auth/login with ?redirectTo if not authenticated.
 * Use at the top of Server Components / layouts that need auth.
 */
export async function requireAuth(redirectTo?: string) {
  const { user, profile } = await getCurrentUser()

  if (!user) {
    const loginUrl = new URL(ROUTES.auth.login, process.env.NEXT_PUBLIC_APP_URL)
    if (redirectTo) loginUrl.searchParams.set('redirectTo', redirectTo)
    redirect(loginUrl.pathname + loginUrl.search)
  }

  return { user, profile }
}

/**
 * Requires the current user to have the 'admin' role.
 * Redirects to / if authenticated but not admin.
 * Redirects to /auth/login if not authenticated at all.
 */
export async function requireAdmin() {
  const { user, profile } = await requireAuth()

  if (profile?.role !== 'admin') {
    redirect(ROUTES.home)
  }

  return { user, profile }
}

/**
 * Returns true if the currently authenticated user is an admin.
 * Safe to call in any server context — returns false on error.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('is_admin')
    return data === true
  } catch {
    return false
  }
}
