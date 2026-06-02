import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { OrderStatusBadge, PaymentStatusBadge } from '@/features/admin/components/status-badges'
import { OrderRowActions } from '@/features/admin/components/order-row-actions'
import { formatCurrency } from '@/lib/utils/format'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OrderFull } from '@/features/checkout/types/checkout.types'

type PageProps = { params: Promise<{ orderId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select('order_number').eq('id', orderId).single()
  return { title: data ? `Order ${data.order_number}` : 'Order' }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin()
  const { orderId } = await params

  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(email, full_name, phone)')
    .eq('id', orderId)
    .single()

  if (!data) notFound()

  const order = data as unknown as OrderFull & {
    profiles: { email: string; full_name: string | null; phone: string | null } | null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Back to orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-mono text-lg font-bold">{order.order_number}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
          {/* Quick status update */}
          <OrderRowActions order={{
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            total_amount: order.total_amount,
            shipping_name: order.shipping_name,
            shipping_city: order.shipping_city,
            shipping_country: order.shipping_country,
            created_at: order.created_at,
            customer_email: order.profiles?.email ?? null,
            item_count: order.order_items.length,
          }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-muted-foreground" />
              Items ({order.order_items.length})
            </h2>
            <ul className="divide-y text-sm">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant_name}: {item.variant_value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.unit_price / 100)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.total_price / 100)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal / 100)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatCurrency(order.discount_amount / 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping_amount === 0 ? 'Free' : formatCurrency(order.shipping_amount / 100)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount / 100)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Customer */}
          {order.profiles && (
            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                Customer
              </h2>
              <p className="text-sm font-medium">{order.profiles.full_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{order.profiles.email}</p>
              {order.profiles.phone && (
                <p className="text-xs text-muted-foreground">{order.profiles.phone}</p>
              )}
            </section>
          )}

          {/* Shipping */}
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Shipping address
            </h2>
            <address className="not-italic text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground text-sm">{order.shipping_name}</p>
              <p>{order.shipping_line1}</p>
              {order.shipping_line2 && <p>{order.shipping_line2}</p>}
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal}</p>
              <p>{order.shipping_country}</p>
              {order.shipping_phone && <p>{order.shipping_phone}</p>}
            </address>
          </section>

          {/* Payment */}
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              Payment
            </h2>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Method: <span className="capitalize font-medium text-foreground">
                {order.payment_method?.replace(/_/g, ' ') ?? 'N/A'}
              </span></p>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
          </section>

          {/* Notes */}
          {order.customer_notes && (
            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold">Customer notes</h2>
              <p className="text-xs text-muted-foreground">{order.customer_notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
