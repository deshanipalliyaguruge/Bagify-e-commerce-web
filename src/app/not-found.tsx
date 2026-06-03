import Link from 'next/link'
import type { Metadata } from 'next'
import { SearchX, Home, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app'

export const metadata: Metadata = {
  title: `Page not found — ${APP_CONFIG.name}`,
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>

      <div>
        <p className="text-7xl font-black text-muted-foreground/30">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants(), 'gap-2')}>
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link href="/shop" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
          <ArrowLeft className="h-4 w-4" />
          Browse shop
        </Link>
      </div>
    </div>
  )
}
