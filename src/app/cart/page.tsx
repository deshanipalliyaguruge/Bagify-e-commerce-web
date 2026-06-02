import type { Metadata } from 'next'
import { APP_CONFIG } from '@/config/app'
import { CartPageClient } from '@/features/cart/components/cart-page-client'

export const metadata: Metadata = {
  title: `Cart — ${APP_CONFIG.name}`,
  description: 'Review your cart and proceed to checkout.',
  robots: { index: false },
}

export default function CartPage() {
  return <CartPageClient />
}
