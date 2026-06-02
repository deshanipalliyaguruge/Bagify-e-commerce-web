'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

interface AdminSearchBarProps {
  placeholder?: string
}

/**
 * Admin search bar — debounced URL param sync.
 * Shared by products, orders, and users tables.
 */
export function AdminSearchBar({ placeholder = 'Search…' }: AdminSearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQ = searchParams.get('q') ?? ''

  const updateQ = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('q', value)
      else params.delete('q')
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const debouncedUpdate = useDebouncedCallback(updateQ, 350)

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        defaultValue={currentQ}
        onChange={(e) => debouncedUpdate(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-8 text-sm"
      />
      {currentQ && (
        <button
          onClick={() => updateQ('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
