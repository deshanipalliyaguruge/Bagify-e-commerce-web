import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/helpers'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Double guard: middleware blocks unauthenticated, layout blocks non-admins
  const { profile } = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar adminName={profile?.full_name ?? profile?.email ?? 'Admin'} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  )
}
