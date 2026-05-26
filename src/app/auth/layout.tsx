import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { APP_CONFIG } from '@/config/app'

export const metadata: Metadata = {
  title: {
    template: `%s — ${APP_CONFIG.name}`,
    default: APP_CONFIG.name,
  },
}

/**
 * Auth layout — centered card on a subtle gradient background.
 * All /auth/* pages use this layout.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      {/* Brand mark */}
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-foreground">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <span className="text-xl tracking-tight">{APP_CONFIG.name}</span>
      </Link>

      {/* Page content (the auth card) */}
      {children}

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
      </p>
    </div>
  )
}
