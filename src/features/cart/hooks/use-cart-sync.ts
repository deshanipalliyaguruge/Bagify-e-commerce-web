'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  getOrCreateDbCartAction,
  syncCartToDbAction,
} from '@/features/cart/actions/cart.actions'

/**
 * useCartSync — Mount this ONCE in a high-level Client Component (e.g. a
 * CartProvider in the root layout).
 *
 * On user login:  fetches / creates the server cart, then merges any
 *                 local guest items into it (local wins on conflict).
 * On user logout: clears the server cart ID so the next guest session
 *                 starts fresh locally.
 */
export function useCartSync() {
  const { user, isLoading } = useAuth()
  const store = useCartStore()
  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip until auth is resolved
    if (isLoading) return

    const currentUserId = user?.id ?? null

    // ── Login: sync local → DB ────────────────────────────────
    if (currentUserId && currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId

      ;(async () => {
        store.setSyncing(true)
        const result = await getOrCreateDbCartAction()
        if (!result.success) {
          store.setSyncing(false)
          return
        }

        const cartId = result.cart.id
        store.setDbCartId(cartId)

        // Merge local items → server (local takes precedence)
        if (store.items.length > 0) {
          await syncCartToDbAction(
            cartId,
            store.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          )
        }

        store.setSyncing(false)
      })()
    }

    // ── Logout: clear DB cart ID ──────────────────────────────
    if (!currentUserId && lastUserIdRef.current !== null) {
      lastUserIdRef.current = null
      store.setDbCartId(null)
    }
  }, [user?.id, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps
}
