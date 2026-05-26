import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase Auth callback handler.
 *
 * Handles:
 *  - Email verification (type=signup)
 *  - Password reset (type=recovery)
 *  - Magic link / OAuth flows
 *
 * Supabase redirects here after email link clicks with ?code=<pkce_code>
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // For password recovery, always go to reset-password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // Otherwise redirect to the intended destination
      const redirectTo = next.startsWith('/') ? `${origin}${next}` : origin
      return NextResponse.redirect(redirectTo)
    }
  }

  // Code missing or exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
