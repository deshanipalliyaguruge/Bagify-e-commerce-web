import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { DataTable, type Column } from '@/features/admin/components/data-table'
import { AdminSearchBar } from '@/features/admin/components/admin-search-bar'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { OrderStatusBadge, PaymentStatusBadge } from '@/features/admin/components/status-badges'
import { OrderRowActions } from '@/features/admin/components/order-row-actions'
import { getAdminOrders } from '@/features/admin/queries/admin.queries'
import { formatCurrency } from '@/lib/utils/format'
import type { AdminOrder, AdminOrderFilters } from '@/features/admin/types/admin.types'
import type { OrderStatus } from '@/types/database'

export const metadata: Metadata = { title: 'Orders' }

type PageProps = { searchParams: Promise<Record<string, string | undefined>> }

const ORDER_STATUSES: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all',        label: 'All'        },
  { value: 'pending',    label: 'Pending'    },
  { value: 'confirmed',  label: 'Confirmed'  },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped'    },
  { value: 'delivered',  label: 'Delivered'  },
  { value: 'cancelled',  label: 'Cancelled'  },
]

const columns: Column<AdminOrder>[] = [
  {
    key: 'order_number',
    header: 'Order #',
    render: (o) => (
      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
        {o.order_number}
      </Link>
    ),
  },
  {
    key: 'customer_email',
    header: 'Customer',
    render: (o) => (
      <div>
        <p className="text-xs font-medium">{o.shipping_name}</p>
        <p className="text-[11px] text-muted-foreground">{o.customer_email ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'item_count',
    header: 'Items',
    render: (o) => <span className="text-xs text-muted-foreground">{o.item_count}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (o) => <OrderStatusBadge status={o.status} />,
  },
  {
    key: 'payment_status',
    header: 'Payment',
    render: (o) => <PaymentStatusBadge status={o.payment_status} />,
  },
  {
    key: 'total_amount',
    header: 'Total',
    className: 'text-right',
    render: (o) => <span className="font-semibold">{formatCurrency(o.total_amount / 100)}</span>,
  },
  {
    key: 'created_at',
    header: 'Date',
    render: (o) => (
      <span className="text-xs text-muted-foreground">
        {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </span>
    ),
  },
  {
    key: 'id',
    header: '',
    className: 'text-right',
    render: (o) => <OrderRowActions order={o} />,
  },
]

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters: AdminOrderFilters = {
    q:      raw.q ?? '',
    status: (raw.status as AdminOrderFilters['status']) ?? 'all',
    page:   Math.max(1, parseInt(raw.page ?? '1', 10)),
  }

  const { data, total, page, pageSize, totalPages } = await getAdminOrders(filters)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} order{total !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Suspense><AdminSearchBar placeholder="Search order number…" /></Suspense>
        <StatusTabFilter current={filters.status} statuses={ORDER_STATUSES} basePath="/admin/orders" />
      </div>

      <DataTable columns={columns} data={data} keyField="id" emptyText="No orders found." />

      <Suspense>
        <AdminPagination currentPage={page} totalPages={totalPages} total={total} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}

// ── Reusable status tab filter ────────────────────────────────────

function StatusTabFilter({
  current, statuses, basePath,
}: {
  current:  string
  statuses: Array<{ value: string; label: string }>
  basePath: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
      {statuses.map((s) => (
        <Link
          key={s.value}
          href={`${basePath}?status=${s.value}`}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            current === s.value
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  )
}
