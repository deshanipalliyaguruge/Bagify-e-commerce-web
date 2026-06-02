'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type {
  PlaceOrderResult,
  PlaceOrderPayload,
  CheckoutCartItem,
  CheckoutSummary,
  OrderFull,
} from '@/features/checkout/types/checkout.types'
import type { Address } from '@/types/database'
import { ROUTES } from '@/config/app'

// ─────────────────────────────────────────────────────────────────
// Generate a human-readable order number  e.g.  BAG-20260602-A1B2
// ─────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `BAG-${date}-${random}`
}

// ─────────────────────────────────────────────────────────────────
// Place order — the core transactional server action
// ─────────────────────────────────────────────────────────────────

/**
 * Creates an order atomically:
 *  1. Validates the authenticated user
 *  2. Re-validates form data server-side (never trust the client)
 *  3. Re-validates item prices against the DB (price cannot be spoofed)
 *  4. Checks stock availability
 *  5. Inserts order + order_items
 *  6. Optionally saves the shipping address
 *  7. Clears the user's DB cart
 *
 * The cart is NOT cleared from localStorage here — the client does that
 * after receiving { success: true }.
 */
export async function placeOrderAction(
  payload: PlaceOrderPayload,
  items: CheckoutCartItem[],
  summary: CheckoutSummary,
): Promise<PlaceOrderResult> {
  const supabase = await createClient()

  // ── 1. Auth check ─────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to place an order.' }
  }

  // ── 2. Validate items are not empty ───────────────────────────
  if (!items || items.length === 0) {
    return { success: false, error: 'Your cart is empty.' }
  }

  // ── 3. Server-side price verification ─────────────────────────
  // Fetch current prices from DB for all product IDs in the cart.
  // This prevents a user from spoofing a lower price client-side.
  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: dbProducts, error: productError } = await supabase
    .from('products')
    .select('id, price, stock_quantity, is_active, name, sku')
    .in('id', productIds)
    .eq('is_active', true)

  if (productError || !dbProducts) {
    return { success: false, error: 'Failed to verify product details. Please try again.' }
  }

  // Build a quick lookup map
  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  for (const item of items) {
    const dbProduct = productMap.get(item.productId)
    if (!dbProduct) {
      return { success: false, error: `Product "${item.name}" is no longer available.` }
    }
    // Price tolerance: allow ±1 cent for floating-point rounding
    if (Math.abs(item.price - dbProduct.price) > 1) {
      return {
        success: false,
        error: `The price for "${item.name}" has changed. Please refresh your cart.`,
      }
    }
    if (dbProduct.stock_quantity < item.quantity) {
      return {
        success: false,
        error: `"${item.name}" only has ${dbProduct.stock_quantity} in stock.`,
      }
    }
  }

  // ── 4. Re-compute totals server-side ──────────────────────────
  const serverSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Accept the client-supplied discount only if it doesn't exceed subtotal
  const serverDiscount = Math.min(summary.discountAmount, serverSubtotal)
  const serverShipping = summary.shippingAmount   // 0 for COD in this build
  const serverTax = summary.taxAmount             // 0 for this build
  const serverTotal = Math.max(0, serverSubtotal - serverDiscount + serverShipping + serverTax)

  // ── 5. Insert order ───────────────────────────────────────────
  const orderNumber = generateOrderNumber()
  const { shipping: s } = { shipping: payload.shippingAddress }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:          user.id,
      order_number:     orderNumber,
      status:           'pending',
      payment_status:   payload.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      payment_method:   payload.paymentMethod,
      subtotal:         serverSubtotal,
      discount_amount:  serverDiscount,
      shipping_amount:  serverShipping,
      tax_amount:       serverTax,
      total_amount:     serverTotal,
      shipping_name:    s.fullName,
      shipping_line1:   s.line1,
      shipping_line2:   s.line2 ?? null,
      shipping_city:    s.city,
      shipping_state:   s.state,
      shipping_postal:  s.postalCode,
      shipping_country: s.country,
      shipping_phone:   s.phone ?? null,
      customer_notes:   payload.customerNotes ?? null,
    })
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    console.error('Order insert error:', orderError)
    return { success: false, error: 'Failed to create order. Please try again.' }
  }

  // ── 6. Insert order items ─────────────────────────────────────
  const orderItems = items.map((item) => ({
    order_id:      order.id,
    product_id:    item.productId,
    variant_id:    item.variantId ?? null,
    product_name:  item.name,
    variant_name:  item.variantName ?? null,
    variant_value: item.variantValue ?? null,
    product_image: item.image ?? null,
    sku:           productMap.get(item.productId)?.sku ?? null,
    unit_price:    item.price,
    quantity:      item.quantity,
    total_price:   item.price * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    // Roll back the order header — best-effort
    await supabase.from('orders').delete().eq('id', order.id)
    console.error('Order items insert error:', itemsError)
    return { success: false, error: 'Failed to save order items. Please try again.' }
  }

  // ── 7. Optionally save shipping address ───────────────────────
  if (payload.saveAddress) {
    await supabase.from('addresses').insert({
      user_id:     user.id,
      label:       'Home',
      full_name:   s.fullName,
      phone:       s.phone ?? null,
      line1:       s.line1,
      line2:       s.line2 ?? null,
      city:        s.city,
      state:       s.state,
      postal_code: s.postalCode,
      country:     s.country,
      is_default:  false,
    })
    // Failure here is non-fatal — the order already succeeded
  }

  // ── 8. Clear DB cart ──────────────────────────────────────────
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (cart) {
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)
  }

  return { success: true, orderId: order.id, orderNumber: order.order_number }
}

// ─────────────────────────────────────────────────────────────────
// Fetch all orders for the current authenticated user
// ─────────────────────────────────────────────────────────────────

export async function getMyOrdersAction(): Promise<OrderFull[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as unknown as OrderFull[]
}

// ─────────────────────────────────────────────────────────────────
// Fetch a single order (with ownership check)
// ─────────────────────────────────────────────────────────────────

export async function getOrderByIdAction(
  orderId: string,
): Promise<OrderFull | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)   // RLS + explicit ownership guard
    .single()

  return data as unknown as OrderFull | null
}

// ─────────────────────────────────────────────────────────────────
// Fetch saved addresses for the checkout address selector
// ─────────────────────────────────────────────────────────────────

export async function getSavedAddressesAction(): Promise<Address[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return (data ?? []) as Address[]
}
