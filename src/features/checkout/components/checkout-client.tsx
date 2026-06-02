'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ShippingAddressForm } from './shipping-address-form'
import { PaymentMethodForm } from './payment-method-form'
import { CheckoutOrderSummary } from './checkout-order-summary'
import { placeOrderAction } from '@/features/checkout/actions/checkout.actions'
import { useCart } from '@/features/cart/hooks/use-cart'
import { useMounted } from '@/hooks/use-mounted'
import type { ShippingAddressValues } from '@/features/checkout/schemas/checkout.schemas'
import type { PaymentMethodValues } from '@/features/checkout/schemas/checkout.schemas'
import type { Address } from '@/types/database'
import type { PaymentMethod } from '@/types/database'
import { ROUTES } from '@/config/app'

type Step = 'shipping' | 'payment'

interface CheckoutClientProps {
  savedAddresses: Address[]
}

export function CheckoutClient({ savedAddresses }: CheckoutClientProps) {
  const router = useRouter()
  const mounted = useMounted()
  const { items, coupon, subtotal, discountAmount, total, clearCart } = useCart()

  const [step, setStep] = useState<Step>('shipping')
  const [shippingValues, setShippingValues] = useState<ShippingAddressValues | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // ── Loading skeleton ─────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  // ── Empty-cart redirect ──────────────────────────────────────

  if (items.length === 0) {
    router.replace(ROUTES.cart)
    return null
  }

  // ── Step breadcrumb ──────────────────────────────────────────

  const steps = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
  ] as const

  // ── Handle shipping step submit ──────────────────────────────

  function handleShippingSubmit(values: ShippingAddressValues) {
    setShippingValues(values)
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Handle payment step submit → place order ─────────────────

  async function handlePaymentSubmit(values: PaymentMethodValues) {
    if (!shippingValues) { setStep('shipping'); return }

    setIsSubmitting(true)
    setServerError(null)

    const result = await placeOrderAction(
      {
        shippingAddress: {
          fullName:   shippingValues.fullName,
          phone:      shippingValues.phone ?? null,
          line1:      shippingValues.line1,
          line2:      shippingValues.line2 ?? null,
          city:       shippingValues.city,
          state:      shippingValues.state,
          postalCode: shippingValues.postalCode,
          country:    shippingValues.country,
        },
        paymentMethod: values.method as PaymentMethod,
        customerNotes: values.customerNotes ?? null,
        saveAddress:   shippingValues.saveAddress,
      },
      items.map((item) => ({
        productId:    item.productId,
        variantId:    item.variantId,
        name:         item.name,
        price:        item.price,
        quantity:     item.quantity,
        image:        item.image,
        variantName:  item.variant?.name ?? null,
        variantValue: item.variant?.value ?? null,
      })),
      {
        subtotal,
        discountAmount,
        shippingAmount: 0,
        taxAmount: 0,
        total,
        couponCode: coupon?.code ?? null,
      },
    )

    if (!result.success) {
      setServerError(result.error)
      setIsSubmitting(false)
      return
    }

    // Success — clear local cart then redirect to confirmation
    await clearCart()
    router.push(`${ROUTES.orders}/${result.orderId}?new=1`)
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header + step indicator */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-3 flex items-center gap-2 text-sm">
          {steps.map((s, idx) => (
            <span key={s.id} className="flex items-center gap-2">
              {idx > 0 && <span className="text-muted-foreground">›</span>}
              <span
                className={
                  step === s.id
                    ? 'font-semibold text-foreground'
                    : step === 'payment' && s.id === 'shipping'
                    ? 'flex items-center gap-1 text-green-600'
                    : 'text-muted-foreground'
                }
              >
                {step === 'payment' && s.id === 'shipping' && (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {s.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form area */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-5">
            {step === 'shipping' ? (
              <>
                <h2 className="mb-4 text-base font-semibold">Shipping address</h2>
                <ShippingAddressForm
                  savedAddresses={savedAddresses}
                  defaultValues={shippingValues ?? undefined}
                  onSubmit={handleShippingSubmit}
                />
              </>
            ) : (
              <>
                <h2 className="mb-4 text-base font-semibold">Payment method</h2>
                <PaymentMethodForm
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setStep('shipping')}
                  isSubmitting={isSubmitting}
                />
              </>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <CheckoutOrderSummary
          items={items}
          coupon={coupon}
          subtotal={subtotal}
          discountAmount={discountAmount}
          shippingAmount={0}
          taxAmount={0}
          total={total}
        />
      </div>
    </div>
  )
}
