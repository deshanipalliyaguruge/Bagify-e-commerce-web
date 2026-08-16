'use client'

import { ShoppingCart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { buttonVariants } from '@/components/ui/button'
import { CartItemRow } from './cart-item-row'
import { CartSummary } from './cart-summary'
import { useCart } from '@/features/cart/hooks/use-cart'
import { ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'

/**
 * Cart drawer — the slide-in panel triggered by the navbar cart icon.
 * Contains the full item list + summary + checkout CTA.
 */
export function CartDrawer({ children }: { children?: React.ReactNode }) {
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

  const isEmpty = items.length === 0

  return (
    <Sheet>
      <SheetTrigger className="relative inline-flex" aria-label={`Cart (${totalItems} items)`}>
        {children ?? <ShoppingCart className="h-5 w-5" />}
        {totalItems > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs text-muted-foreground">
                Add items from the shop to get started.
              </p>
              <Link
                href={ROUTES.shop}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-2')}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="divide-y">
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
          )}
        </div>

        {/* Footer with summary */}
        {!isEmpty && (
          <SheetFooter className="border-t">
            <CartSummary
              subtotal={subtotal}
              discountAmount={discountAmount}
              total={total}
              coupon={coupon}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              checkoutHref={ROUTES.checkout}
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
