import type { Metadata } from 'next'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { requireAuth } from '@/lib/auth/helpers'
import { getMyOrdersAction } from '@/features/checkout/actions/checkout.actions'
import { formatCurrency } from '@/lib/utils/format'
import { APP_CONFIG, ROUTES } from '@/config/app'

export const metadata: Metadata = {
  title: `My Orders — ${APP_CONFIG.name}`,
  description: 'View your order history.',
  robots: { index: false },
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-800',
}

export default async function OrdersPage() {
  await requireAuth(ROUTES.orders)
  const orders = await getMyOrdersAction()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground">When you place an order it will appear here.</p>
          <Link href={ROUTES.shop} className={buttonVariants({ variant: 'default' })}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${ROUTES.orders}/${order.id}`}
                className="group block rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold group-hover:text-primary">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.order_items.length}{' '}
                      {order.order_items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-base font-bold">
                      {formatCurrency(order.total_amount / 100)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
