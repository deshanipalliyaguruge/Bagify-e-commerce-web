'use client'

import { useCartSync } from '@/features/cart/hooks/use-cart-sync'

/**
 * CartProvider — mount once in the root layout (Client Component boundary).
 * Activates the guest→authenticated cart merge on login/logout.
 * Renders no markup itself.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  useCartSync()
  return <>{children}</>
}
