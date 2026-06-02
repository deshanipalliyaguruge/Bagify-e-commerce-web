import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus, Star } from 'lucide-react'
import { DataTable, type Column } from '@/features/admin/components/data-table'
import { AdminSearchBar } from '@/features/admin/components/admin-search-bar'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { ActiveBadge, StockBadge } from '@/features/admin/components/status-badges'
import { ProductRowActions } from '@/features/admin/components/product-row-actions'
import { getAdminProducts } from '@/features/admin/queries/admin.queries'
import { formatCurrency } from '@/lib/utils/format'
import { buttonVariants } from '@/components/ui/button'
import type { AdminProduct, AdminProductFilters } from '@/features/admin/types/admin.types'

export const metadata: Metadata = { title: 'Products' }

type PageProps = { searchParams: Promise<Record<string, string | undefined>> }

const columns: Column<AdminProduct>[] = [
  {
    key: 'name',
    header: 'Product',
    render: (p) => (
      <div>
        <p className="font-medium leading-snug">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.sku ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'category_name',
    header: 'Category',
    render: (p) => <span className="text-xs text-muted-foreground">{p.category_name ?? '—'}</span>,
  },
  {
    key: 'price',
    header: 'Price',
    render: (p) => (
      <div>
        <p className="font-medium">{formatCurrency(p.price / 100)}</p>
        {p.compare_at_price && (
          <p className="text-xs text-muted-foreground line-through">{formatCurrency(p.compare_at_price / 100)}</p>
        )}
      </div>
    ),
  },
  {
    key: 'stock_quantity',
    header: 'Stock',
    render: (p) => <StockBadge qty={p.stock_quantity} />,
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (p) => <ActiveBadge active={p.is_active} />,
  },
  {
    key: 'is_featured',
    header: 'Featured',
    render: (p) => p.is_featured
      ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      : <Star className="h-3.5 w-3.5 text-muted-foreground/30" />,
  },
  {
    key: 'average_rating',
    header: 'Rating',
    render: (p) => (
      <span className="text-xs text-muted-foreground">
        {p.average_rating ? `${p.average_rating.toFixed(1)} (${p.review_count})` : '—'}
      </span>
    ),
  },
  {
    key: 'id',
    header: '',
    className: 'text-right',
    render: (p) => <ProductRowActions product={p} />,
  },
]

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters: AdminProductFilters = {
    q:      raw.q ?? '',
    status: (raw.status as AdminProductFilters['status']) ?? 'all',
    page:   Math.max(1, parseInt(raw.page ?? '1', 10)),
  }

  const { data, total, page, pageSize, totalPages } = await getAdminProducts(filters)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: 'sm' })}>
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Suspense>
          <AdminSearchBar placeholder="Search products…" />
        </Suspense>
        <StatusFilter current={filters.status} />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={data} keyField="id" emptyText="No products found." />

      {/* Pagination */}
      <Suspense>
        <AdminPagination currentPage={page} totalPages={totalPages} total={total} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}

// ── Status filter tabs ────────────────────────────────────────────

function StatusFilter({ current }: { current: string }) {
  const options = [
    { value: 'all',      label: 'All'      },
    { value: 'active',   label: 'Active'   },
    { value: 'inactive', label: 'Inactive' },
  ]
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={`/admin/products?status=${opt.value}`}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === opt.value
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  )
}
