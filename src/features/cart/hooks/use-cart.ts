'use client'

import { useCallback } from 'react'
import { useCartStore, type CartItem } from '@/stores/cart-store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  upsertCartItemAction,
  removeCartItemAction,
  getOrCreateDbCartAction,
} from '@/features/cart/actions/cart.actions'
import { getImageUrl } from '@/lib/utils/helpers'
import { formatCurrency } from '@/lib/utils/format'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type AddToCartInput = {
  productId: string
  variantId?: string | null
  name: string
  slug: string
  /** Price in cents */
  price: number
  imagePath?: string | null
  quantity?: number
  maxQuantity?: number
  variant?: { id: string; name: string; value: string } | null
}

// ─────────────────────────────────────────────────────────────────
// useCart — primary consumer hook
// ─────────────────────────────────────────────────────────────────

/**
 * Unified cart hook. Provides all cart state and actions.
 * Optimistically updates local Zustand store, then syncs to DB for
 * authenticated users. Errors leave the local state intact (optimistic).
 */
export function useCart() {
  const store = useCartStore()
  const { user, isLoading: authLoading } = useAuth()

  // ── Helpers ──────────────────────────────────────────────────

  async function ensureDbCart(): Promise<string | null> {
    if (!user) return null
    if (store.dbCartId) return store.dbCartId

    const result = await getOrCreateDbCartAction()
    if (!result.success) return null

    store.setDbCartId(result.cart.id)
    return result.cart.id
  }

  // ── Add to cart ───────────────────────────────────────────────

  const addToCart = useCallback(
    async (input: AddToCartInput) => {
      const itemId = input.variantId
        ? `${input.productId}-${input.variantId}`
        : input.productId

      const cartItem: Omit<CartItem, 'quantity'> & { quantity?: number } = {
        id: itemId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        name: input.name,
        slug: input.slug,
        price: input.price,
        image: getImageUrl(input.imagePath ?? null),
        quantity: input.quantity ?? 1,
        variant: input.variant ?? null,
        maxQuantity: input.maxQuantity,
      }

      // Optimistic update — instant UI feedback
      store.addItem(cartItem)

      // DB sync for authenticated users
      if (!user) return

      const cartId = await ensureDbCart()
      if (!cartId) return

      store.setSyncing(true)
      await upsertCartItemAction(cartId, {
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity ?? 1,
        price: input.price,
      })
      store.setSyncing(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, store.dbCartId],
  )

  // ── Remove item ───────────────────────────────────────────────

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const item = store.items.find((i) => i.id === itemId)
      if (!item) return

      // Optimistic
      store.removeItem(itemId)

      if (!user || !store.dbCartId) return

      store.setSyncing(true)
      await removeCartItemAction(store.dbCartId, item.productId, item.variantId)
      store.setSyncing(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, store.dbCartId, store.items],
  )

  // ── Update quantity ───────────────────────────────────────────

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const item = store.items.find((i) => i.id === itemId)
      if (!item) return

      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      // Optimistic
      store.updateQuantity(itemId, quantity)

      if (!user || !store.dbCartId) return

      store.setSyncing(true)
      await upsertCartItemAction(store.dbCartId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity,
        price: item.price,
      })
      store.setSyncing(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, store.dbCartId, store.items],
  )

  // ── Clear cart ────────────────────────────────────────────────

  const clearCart = useCallback(async () => {
    store.clearCart()
    // DB clear is handled by order creation on the server — no action needed here
  }, [store])

  // ── Formatted values ──────────────────────────────────────────

  const formattedSubtotal = formatCurrency(store.subtotal / 100)
  const formattedDiscount = formatCurrency(store.discountAmount / 100)
  const formattedTotal = formatCurrency(store.total / 100)

  return {
    // State
    items: store.items,
    coupon: store.coupon,
    isSyncing: store.isSyncing,
    isAuthLoading: authLoading,
    isAuthenticated: !!user,

    // Derived numbers
    totalItems: store.totalItems,
    subtotal: store.subtotal,
    discountAmount: store.discountAmount,
    total: store.total,

    // Formatted strings
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,

    // Coupon
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Helpers
    isInCart: (productId: string, variantId?: string | null) => {
      const id = variantId ? `${productId}-${variantId}` : productId
      return store.items.some((i) => i.id === id)
    },
    getItemQuantity: (productId: string, variantId?: string | null) => {
      const id = variantId ? `${productId}-${variantId}` : productId
      return store.items.find((i) => i.id === id)?.quantity ?? 0
    },
  }
}
