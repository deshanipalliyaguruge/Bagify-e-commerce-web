import { redirect } from 'next/navigation'
import { requireAuth, requireAdmin } from '@/lib/auth/helpers'
import { ROUTES } from '@/config/app'

interface AuthGuardProps {
  children: React.ReactNode
  /** If true, also verifies the user has the 'admin' role */
  requireAdminRole?: boolean
  /** Where to redirect if unauthenticated (default: /auth/login) */
  loginUrl?: string
}

/**
 * Server Component auth guard.
 *
 * Wrap any Server Component layout/page with this to enforce auth.
 * For admin sections, pass requireAdminRole={true}.
 *
 * @example — protected layout
 * ```tsx
 * export default async function AccountLayout({ children }) {
 *   return <AuthGuard>{children}</AuthGuard>
 * }
 * ```
 *
 * @example — admin layout
 * ```tsx
 * export default async function AdminLayout({ children }) {
 *   return <AuthGuard requireAdminRole>{children}</AuthGuard>
 * }
 * ```
 */
export async function AuthGuard({
  children,
  requireAdminRole = false,
  loginUrl = ROUTES.auth.login,
}: AuthGuardProps) {
  if (requireAdminRole) {
    // requireAdmin internally calls requireAuth and redirects if not admin
    await requireAdmin()
  } else {
    const { user } = await requireAuth()
    if (!user) redirect(loginUrl)
  }

  return <>{children}</>
}
