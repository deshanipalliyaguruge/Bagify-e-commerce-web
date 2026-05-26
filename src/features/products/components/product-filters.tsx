'use client'

import { useCallback } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface ProductFiltersProps {
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
  currentCategory: string
}

export function ProductFilters({ categories, currentCategory }: ProductFiltersProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildHref = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (slug) {
        params.set('category', slug)
      } else {
        params.delete('category')
      }
      params.set('page', '1')
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams],
  )

  return (
    <aside className="flex flex-col gap-4">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          <Link
            href={buildHref('')}
            className={cn(
              'rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
              !currentCategory && 'bg-accent font-medium text-accent-foreground',
            )}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildHref(cat.slug)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                currentCategory === cat.slug && 'bg-accent font-medium text-accent-foreground',
              )}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
