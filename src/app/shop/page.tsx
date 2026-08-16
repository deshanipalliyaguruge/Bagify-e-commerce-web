import type { Metadata } from 'next'
import { Suspense } from 'react'
import { APP_CONFIG } from '@/config/app'
import { getProducts, getActiveCategories } from '@/features/products/queries/product.queries'
import { parseProductFilters } from '@/features/products/schemas/product.schemas'
import { ProductGrid } from '@/features/products/components/product-grid'
import { ProductFilters } from '@/features/products/components/product-filters'
import { ProductSort } from '@/features/products/components/product-sort'
import { ProductSearch } from '@/features/products/components/product-search'
import { PaginationControls } from '@/features/products/components/product-pagination'
import { ProductGridSkeleton } from '@/features/products/components/product-skeleton'

// Revalidate shop listings every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  title: `Shop — ${APP_CONFIG.name}`,
  description: 'Browse our full collection of premium bags and accessories.',
  openGraph: {
    title: `Shop — ${APP_CONFIG.name}`,
    description: 'Browse our full collection of premium bags and accessories.',
  },
}

// searchParams is a Promise in Next.js 15 — must be awaited
type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const rawParams = await searchParams
  const filters = parseProductFilters(rawParams)

  // Parallel data fetching
  const [{ products, total, page, pageSize, totalPages }, categories] = await Promise.all([
    getProducts(filters),
    getActiveCategories(),
  ])

  return (
    <div className="flex-1">
      <section className="border-b bg-gradient-to-r from-secondary/80 via-background to-orange-50 px-4 py-10">
        <div className="container mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">The Bagify collection</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Find your everyday bag</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Explore practical, beautifully made bags for work, weekends, travel, and everything in between.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters — wrapped in Suspense for useSearchParams */}
        <aside className="w-full lg:w-60 lg:flex-shrink-0">
          <div className="rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-32">
            <Suspense>
              <ProductFilters categories={categories} currentCategory={filters.category} />
            </Suspense>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Suspense>
              <ProductSearch />
            </Suspense>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {total} {total === 1 ? 'product' : 'products'}
              </span>
              <Suspense>
                <ProductSort currentSort={filters.sort} />
              </Suspense>
            </div>
          </div>

          {/* Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <Suspense>
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
              />
            </Suspense>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
