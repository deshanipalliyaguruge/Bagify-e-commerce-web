'use client'

import { useState } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { validateCouponAction } from '@/features/cart/actions/cart.actions'
import type { Coupon } from '@/stores/cart-store'

interface CartSummaryProps {
  subtotal: number
  discountAmount: number
  total: number
  coupon: Coupon | null
  onApplyCoupon: (coupon: Coupon) => void
  onRemoveCoupon: () => void
  /** If provided, renders a checkout CTA */
  onCheckout?: () => void
  /** Renders a Link instead of a button for drawer → page navigation */
  checkoutHref?: string
  isCheckoutDisabled?: boolean
}

export function CartSummary({
  subtotal,
  discountAmount,
  total,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  checkoutHref,
}: CartSummaryProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  async function handleApplyCoupon() {
    if (!code.trim()) return
    setIsValidating(true)
    setCouponError(null)

    const result = await validateCouponAction(code.trim())

    if (!result.success) {
      setCouponError(result.error)
      setIsValidating(false)
      return
    }

    onApplyCoupon({
      code: code.toUpperCase(),
      discountAmount: 0,
      discountPercent: result.discount,
      description: result.description,
    })
    setCode('')
    setIsValidating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Coupon input */}
      {!coupon ? (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setCouponError(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            placeholder="Coupon code"
            className="h-8 text-sm uppercase"
            aria-label="Coupon code"
            disabled={isValidating}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyCoupon}
            disabled={!code.trim() || isValidating}
            className="flex-shrink-0"
          >
            {isValidating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-primary">{coupon.code}</span>
            <span className="text-muted-foreground">— {coupon.description}</span>
          </div>
          <button
            onClick={onRemoveCoupon}
            aria-label="Remove coupon"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {couponError && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{couponError}</AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Totals */}
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal / 100)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Discount</span>
            <span>−{formatCurrency(discountAmount / 100)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total / 100)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Taxes and shipping calculated at checkout
        </p>
      </div>

      {/* Checkout CTA */}
      {checkoutHref && (
        <a
          href={checkoutHref}
          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          Proceed to checkout
        </a>
      )}
    </div>
  )
}
