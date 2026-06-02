import type { Metadata } from 'next'
import { APP_CONFIG, ROUTES } from '@/config/app'
import { requireAuth } from '@/lib/auth/helpers'
import { getSavedAddressesAction } from '@/features/checkout/actions/checkout.actions'
import { CheckoutClient } from '@/features/checkout/components/checkout-client'

export const metadata: Metadata = {
  title: `Checkout — ${APP_CONFIG.name}`,
  description: 'Complete your order securely.',
  robots: { index: false },
}

export default async function CheckoutPage() {
  // Server-side auth gate — redirects to login if not signed in
  await requireAuth(ROUTES.checkout)

  const savedAddresses = await getSavedAddressesAction()

  return <CheckoutClient savedAddresses={savedAddresses} />
}
