import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Route groups — evaluated in order.
 *
 * Admin routes: /admin/*
 *   → Unauthenticated: redirect to login
 *   → Authenticated non-admin: the /admin layout does the role check
 *     (middleware avoids DB queries for performance)
 *
 * Protected routes: /account, /checkout, /orders
 *   → Unauthenticated: redirect to login with redirectTo param
 *
 * Auth routes: /auth/login, /auth/register
 *   → Authenticated: redirect to home (prevent double-login)
 */

const PROTECTED_ROUTES = ['/account', '/checkout', '/orders', '/admin']
const AUTH_ONLY_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  // Refresh session on every request (required by @supabase/ssr)
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  // ── Protected routes ───────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Auth-only routes (redirect if already logged in) ──────────
  const isAuthRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))

  if (isAuthRoute && user) {
    // Preserve the redirectTo param if present (e.g. user was
    // redirected here from a protected page)
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public image files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
