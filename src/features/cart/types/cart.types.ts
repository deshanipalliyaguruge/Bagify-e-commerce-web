import type { CartItem } from '@/stores/cart-store'
import type { ActionResult } from '@/features/auth/types/auth.types'

// Re-export for convenience
export type { CartItem, Coupon } from '@/stores/cart-store'

/** What getOrCreateDbCart() returns */
export type DbCart = {
  id: string
  items: DbCartItem[]
}

export type DbCartItem = {
  id: string
  cart_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
}

/** Shape passed to syncCartToDb() */
export type CartSyncPayload = {
  cartId: string
  items: Pick<CartItem, 'id' | 'productId' | 'variantId' | 'quantity' | 'price'>[]
}

export type CartActionResult = ActionResult<{ cartId: string }>
