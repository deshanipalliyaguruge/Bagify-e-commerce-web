import { z } from 'zod'
import { phoneSchema } from '@/lib/utils/validation'

// ─────────────────────────────────────────────────────────────────
// Shipping address form schema
// ─────────────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  fullName:    z.string().min(2, 'Full name is required').max(100),
  phone:       phoneSchema,
  line1:       z.string().min(3, 'Address line 1 is required').max(200),
  line2:       z.string().max(200).optional().or(z.literal('')),
  city:        z.string().min(2, 'City is required').max(100),
  state:       z.string().min(2, 'State / Province is required').max(100),
  postalCode:  z.string().min(3, 'Postal code is required').max(20),
  country:     z.string().length(2, 'Select a country').default('US'),
  saveAddress: z.boolean().default(false),
})

export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>

// ─────────────────────────────────────────────────────────────────
// Payment method schema
// ─────────────────────────────────────────────────────────────────

export const paymentMethodSchema = z.object({
  method: z.enum(['cash_on_delivery', 'card', 'paypal', 'bank_transfer'], {
    error: 'Select a payment method',
  }),
  customerNotes: z.string().max(500).optional().or(z.literal('')),
})

export type PaymentMethodValues = z.infer<typeof paymentMethodSchema>

// ─────────────────────────────────────────────────────────────────
// Full checkout form (both steps combined for server-side validation)
// ─────────────────────────────────────────────────────────────────

export const checkoutSchema = shippingAddressSchema.and(paymentMethodSchema)
export type CheckoutValues = z.infer<typeof checkoutSchema>
