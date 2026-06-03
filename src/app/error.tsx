'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

/**
 * Route-segment error boundary.
 * Catches errors within a layout segment without crashing the full page.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This section failed to load. You can try again or return home.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Ref: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
      </div>
    </div>
  )
}
