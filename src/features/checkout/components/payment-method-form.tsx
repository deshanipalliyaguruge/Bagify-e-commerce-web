'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Truck, Building2, Wallet } from 'lucide-react'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { paymentMethodSchema, type PaymentMethodValues } from '@/features/checkout/schemas/checkout.schemas'
import { cn } from '@/lib/utils'

const PAYMENT_OPTIONS = [
  {
    id: 'cash_on_delivery' as const,
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Truck,
  },
  {
    id: 'card' as const,
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Amex (coming soon)',
    icon: CreditCard,
    disabled: true,
  },
  {
    id: 'paypal' as const,
    label: 'PayPal',
    description: 'Fast, secure checkout (coming soon)',
    icon: Wallet,
    disabled: true,
  },
  {
    id: 'bank_transfer' as const,
    label: 'Bank Transfer',
    description: 'Direct bank deposit (coming soon)',
    icon: Building2,
    disabled: true,
  },
]

interface PaymentMethodFormProps {
  onSubmit: (values: PaymentMethodValues) => void
  onBack: () => void
  isSubmitting?: boolean
}

export function PaymentMethodForm({ onSubmit, onBack, isSubmitting }: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodValues>({
    resolver: zodResolver(paymentMethodSchema) as any,
    defaultValues: { method: 'cash_on_delivery', customerNotes: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Payment options */}
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Payment method</FormLabel>
              <div className="grid gap-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = field.value === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => !opt.disabled && field.onChange(opt.id)}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                        isSelected && !opt.disabled
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50',
                        opt.disabled && 'cursor-not-allowed opacity-40',
                      )}
                      aria-pressed={isSelected}
                    >
                      {/* Radio circle */}
                      <span
                        className={cn(
                          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                          isSelected && !opt.disabled
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground',
                        )}
                      >
                        {isSelected && !opt.disabled && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </span>

                      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

                      <div className="min-w-0">
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order notes */}
        <FormField
          control={form.control}
          name="customerNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order notes (optional)</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Special delivery instructions…"
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : 'Place order'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
