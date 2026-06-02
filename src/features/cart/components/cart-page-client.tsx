'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { CartItemRow } from './cart-item-row'
import { CartSummary } from './cart-summary'
import { useCart } from '@/features/cart/hooks/use-cart'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'

/**
 * Full cart page client component.
 * Cart state is client-only (Zustand/localStorage), so we guard against
 * SSR hydration mismatch with useMounted().
 */
export function CartPageClient() {
  const mounted = useMounted()
  const {
    items,
    coupon,
    isSyncing,
    totalItems,
    subtotal,
    discountAmount,
    total,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart()

  // Render skeleton until localStorage has hydrated
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const isEmpty = items.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Your cart
          {totalItems > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>
        <Link
          href={ROUTES.shop}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet. Start browsing to find something
            you&apos;ll love.
          </p>
          <Link href={ROUTES.shop} className={buttonVariants({ variant: 'default' })}>
            Browse products
          </Link>
        </div>
      ) : (
        /* Cart layout */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Item list */}
          <div className="divide-y rounded-xl border bg-card p-4 lg:col-span-2">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isSyncing={isSyncing}
                onRemove={removeFromCart}
                onQuantityChange={updateQuantity}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-xl border bg-card p-4">
            <h2 className="mb-4 text-base font-semibold">Order summary</h2>
            <CartSummary
              subtotal={subtotal}
              discountAmount={discountAmount}
              total={total}
              coupon={coupon}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              checkoutHref={ROUTES.checkout}
            />
          </div>
        </div>
      )}
    </div>
  )
}
