'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { QuantityControl } from './quantity-control'
import { formatCurrency } from '@/lib/utils/format'
import { ROUTES } from '@/config/app'
import type { CartItem } from '@/stores/cart-store'

interface CartItemRowProps {
  item: CartItem
  onRemove: (id: string) => void
  onQuantityChange: (id: string, qty: number) => void
  isSyncing?: boolean
}

/**
 * Single row representing one cart item.
 * Used in the cart drawer AND the full cart page.
 */
export function CartItemRow({
  item,
  onRemove,
  onQuantityChange,
  isSyncing,
}: CartItemRowProps) {
  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-3 py-3">
      {/* Thumbnail */}
      <Link
        href={ROUTES.product(item.slug)}
        className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
        tabIndex={-1}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={ROUTES.product(item.slug)}
            className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
          >
            {item.name}
          </Link>
          <span className="flex-shrink-0 text-sm font-semibold">
            {formatCurrency(lineTotal / 100)}
          </span>
        </div>

        {item.variant && (
          <p className="text-xs text-muted-foreground">
            {item.variant.name}: {item.variant.value}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          <QuantityControl
            quantity={item.quantity}
            maxQuantity={item.maxQuantity}
            disabled={isSyncing}
            onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
            onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
            onRemove={() => onRemove(item.id)}
          />
          <span className="text-xs text-muted-foreground">
            {formatCurrency(item.price / 100)} each
          </span>
        </div>
      </div>

      {/* Syncing indicator */}
      {isSyncing && (
        <Loader2 className="mt-1 h-3 w-3 flex-shrink-0 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
