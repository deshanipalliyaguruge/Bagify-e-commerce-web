import type { Metadata } from 'next'
import Link from 'next/link'
import { DollarSign, ShoppingCart, Package, Users, ArrowRight } from 'lucide-react'
import { StatCard } from '@/features/admin/components/stat-card'
import { DataTable, type Column } from '@/features/admin/components/data-table'
import { OrderStatusBadge } from '@/features/admin/components/status-badges'
import { getAdminStats, getRecentOrders } from '@/features/admin/queries/admin.queries'
import { formatCurrency } from '@/lib/utils/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AdminOrder } from '@/features/admin/types/admin.types'

export const metadata: Metadata = { title: 'Dashboard' }

const recentOrderColumns: Column<AdminOrder>[] = [
  {
    key: 'order_number',
    header: 'Order',
    render: (o) => (
      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
        {o.order_number}
      </Link>
    ),
  },
  {
    key: 'customer_email',
    header: 'Customer',
    render: (o) => <span className="text-xs text-muted-foreground">{o.customer_email ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (o) => <OrderStatusBadge status={o.status} />,
  },
  {
    key: 'total_amount',
    header: 'Total',
    className: 'text-right',
    render: (o) => <span className="font-medium">{formatCurrency(o.total_amount / 100)}</span>,
  },
]

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getAdminStats(),
    getRecentOrders(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (30 days)"
          value={formatCurrency(stats.totalRevenue / 100)}
          change={stats.revenueChange}
          icon={<DollarSign className="h-4 w-4" />}
          accent="green"
        />
        <StatCard
          label="Orders (30 days)"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={<ShoppingCart className="h-4 w-4" />}
          accent="blue"
        />
        <StatCard
          label="Active Products"
          value={stats.totalProducts.toLocaleString()}
          icon={<Package className="h-4 w-4" />}
          accent="purple"
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          accent="amber"
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1 text-xs')}
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <DataTable
          columns={recentOrderColumns}
          data={recentOrders}
          keyField="id"
          emptyText="No orders yet."
        />
      </div>
    </div>
  )
}
