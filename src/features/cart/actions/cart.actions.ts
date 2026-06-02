'use server'

import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/stores/cart-store'
import type { CartActionResult, DbCart } from '@/features/cart/types/cart.types'

// ─────────────────────────────────────────────────────────────────
// Get or create the authenticated user's server-side cart
// ─────────────────────────────────────────────────────────────────

export async function getOrCreateDbCartAction(): Promise<
  { success: true; cart: DbCart } | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // Try to find existing cart
  const { data: existing } = await supabase
    .from('carts')
    .select('id, cart_items(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return {
      success: true,
      cart: {
        id: existing.id,
        items: (existing.cart_items as DbCart['items']) ?? [],
      },
    }
  }

  // Create new cart
  const { data: created, error } = await supabase
    .from('carts')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error || !created) {
    return { success: false, error: error?.message ?? 'Failed to create cart' }
  }

  return { success: true, cart: { id: created.id, items: [] } }
}

// ─────────────────────────────────────────────────────────────────
// Add or update a single item in the DB cart (optimistic-safe)
// ─────────────────────────────────────────────────────────────────

export async function upsertCartItemAction(
  cartId: string,
  item: Pick<CartItem, 'productId' | 'variantId' | 'quantity' | 'price'>,
): Promise<CartActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('cart_items').upsert(
    {
      cart_id: cartId,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      unit_price: item.price,
    },
    {
      onConflict: 'cart_id, product_id, variant_id',
      ignoreDuplicates: false,
    },
  )

  if (error) return { success: false, error: error.message }
  return { success: true, data: { cartId } }
}

// ─────────────────────────────────────────────────────────────────
// Remove an item from the DB cart
// ─────────────────────────────────────────────────────────────────

export async function removeCartItemAction(
  cartId: string,
  productId: string,
  variantId: string | null,
): Promise<CartActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  let query = supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId)

  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }

  const { error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: { cartId } }
}

// ─────────────────────────────────────────────────────────────────
// Full cart sync: replace all DB items with the current local state
// Called on login to merge guest cart → server cart
// ─────────────────────────────────────────────────────────────────

export async function syncCartToDbAction(
  cartId: string,
  items: Pick<CartItem, 'productId' | 'variantId' | 'quantity' | 'price'>[],
): Promise<CartActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // Clear all existing items first
  await supabase.from('cart_items').delete().eq('cart_id', cartId)

  if (items.length === 0) return { success: true, data: { cartId } }

  const { error } = await supabase.from('cart_items').insert(
    items.map((item) => ({
      cart_id: cartId,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      unit_price: item.price,
    })),
  )

  if (error) return { success: false, error: error.message }
  return { success: true, data: { cartId } }
}

// ─────────────────────────────────────────────────────────────────
// Clear all items from the DB cart
// ─────────────────────────────────────────────────────────────────

export async function clearDbCartAction(cartId: string): Promise<CartActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { cartId } }
}

// ─────────────────────────────────────────────────────────────────
// Validate coupon code (stub — extend with real coupon table later)
// ─────────────────────────────────────────────────────────────────

export async function validateCouponAction(
  code: string,
): Promise<{ success: true; discount: number; description: string } | { success: false; error: string }> {
  // TODO: Query a coupons table when created.
  // For now, a single hard-coded demo coupon.
  const DEMO_COUPONS: Record<string, { discount: number; description: string }> = {
    BAGIFY10: { discount: 0.10, description: '10% off your order' },
    WELCOME20: { discount: 0.20, description: '20% off for new customers' },
  }

  await new Promise((resolve) => setTimeout(resolve, 300)) // simulate latency

  const found = DEMO_COUPONS[code.toUpperCase()]
  if (!found) return { success: false, error: 'Invalid or expired coupon code.' }

  return { success: true, ...found }
}
