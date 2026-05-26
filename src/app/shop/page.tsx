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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Shop</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters — wrapped in Suspense for useSearchParams */}
        <aside className="w-full lg:w-56 lg:flex-shrink-0">
          <Suspense>
            <ProductFilters categories={categories} currentCategory={filters.category} />
          </Suspense>
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
  )
}
