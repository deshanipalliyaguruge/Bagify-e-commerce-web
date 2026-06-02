import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Package, MapPin, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { requireAuth } from '@/lib/auth/helpers'
import { getOrderByIdAction } from '@/features/checkout/actions/checkout.actions'
import { formatCurrency } from '@/lib/utils/format'
import { APP_CONFIG, ROUTES } from '@/config/app'

type OrderDetailPageProps = { params: Promise<{ orderId: string }> }

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params
  const order = await getOrderByIdAction(orderId)
  return {
    title: order
      ? `Order ${order.order_number} — ${APP_CONFIG.name}`
      : `Order — ${APP_CONFIG.name}`,
  }
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:    { label: 'Pending',    variant: 'secondary' },
  confirmed:  { label: 'Confirmed',  variant: 'default' },
  processing: { label: 'Processing', variant: 'default' },
  shipped:    { label: 'Shipped',    variant: 'default' },
  delivered:  { label: 'Delivered',  variant: 'default' },
  cancelled:  { label: 'Cancelled',  variant: 'destructive' },
  refunded:   { label: 'Refunded',   variant: 'outline' },
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAuth()
  const { orderId } = await params
  const order = await getOrderByIdAction(orderId)

  if (!order) notFound()

  const isNew = false // client would pass ?new=1 — server just shows the page
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'outline' as const }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Order placed!' : `Order ${order.order_number}`}
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          {isNew
            ? `Thank you for your order. We'll send updates to your email.`
            : `Order placed on ${new Date(order.created_at).toLocaleDateString()}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Items */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Package className="h-4 w-4 text-muted-foreground" />
            Items ordered
          </h2>
          <ul className="divide-y">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant_name}: {item.variant_value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium">{formatCurrency(item.total_price / 100)}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>−{formatCurrency(order.discount_amount / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping_amount === 0 ? 'Free' : formatCurrency(order.shipping_amount / 100)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount / 100)}</span>
            </div>
          </div>
        </section>

        {/* Shipping address */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Shipping address
          </h2>
          <address className="not-italic text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{order.shipping_name}</p>
            <p>{order.shipping_line1}</p>
            {order.shipping_line2 && <p>{order.shipping_line2}</p>}
            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal}</p>
            <p>{order.shipping_country}</p>
            {order.shipping_phone && <p>{order.shipping_phone}</p>}
          </address>
        </section>

        {/* Payment */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Payment
          </h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Method:{' '}
              <span className="capitalize font-medium text-foreground">
                {order.payment_method?.replace(/_/g, ' ') ?? 'N/A'}
              </span>
            </p>
            <p>
              Status:{' '}
              <span className="capitalize font-medium text-foreground">
                {order.payment_status}
              </span>
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-3 pt-2">
          <Link href={ROUTES.orders} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            View all orders
          </Link>
          <Link href={ROUTES.shop} className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
