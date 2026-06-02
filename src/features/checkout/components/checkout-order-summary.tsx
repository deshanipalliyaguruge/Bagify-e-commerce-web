import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import type { CartItem } from '@/stores/cart-store'
import type { Coupon } from '@/stores/cart-store'

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  coupon: Coupon | null
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  total: number
}

export function CheckoutOrderSummary({
  items,
  coupon,
  subtotal,
  discountAmount,
  shippingAmount,
  taxAmount,
  total,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 h-fit">
      <h2 className="font-semibold">Order summary</h2>

      {/* Items */}
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
              {/* Quantity badge */}
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {item.quantity}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-muted-foreground">
                  {item.variant.name}: {item.variant.value}
                </p>
              )}
              <p className="mt-auto text-sm font-medium">
                {formatCurrency((item.price * item.quantity) / 100)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Separator />

      {/* Coupon */}
      {coupon && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            Coupon
            <Badge variant="secondary" className="text-xs font-mono">{coupon.code}</Badge>
          </span>
          <span className="text-primary">−{formatCurrency(discountAmount / 100)}</span>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal / 100)}</span>
        </div>
        {discountAmount > 0 && !coupon && (
          <div className="flex justify-between text-primary">
            <span>Discount</span>
            <span>−{formatCurrency(discountAmount / 100)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{shippingAmount === 0 ? 'Free' : formatCurrency(shippingAmount / 100)}</span>
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(taxAmount / 100)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total / 100)}</span>
        </div>
      </div>
    </div>
  )
}
