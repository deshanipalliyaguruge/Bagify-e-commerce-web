'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/helpers'
import type { AdminActionResult } from '@/features/admin/types/admin.types'
import type { OrderStatus, UserRole } from '@/types/database'

// ─────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────

export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  return { success: true, message: `Product ${isActive ? 'activated' : 'deactivated'}.` }
}

export async function toggleProductFeaturedAction(
  productId: string,
  isFeatured: boolean,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_featured: isFeatured })
    .eq('id', productId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  return { success: true, message: `Product ${isFeatured ? 'featured' : 'unfeatured'}.` }
}

export async function deleteProductAction(productId: string): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  // Soft delete — deactivate rather than hard delete to preserve order history
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  return { success: true, message: 'Product deactivated.' }
}

// ─────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const update: {
    status: OrderStatus
    shipped_at?: string
    delivered_at?: string
    cancelled_at?: string
  } = { status }

  // Set timestamp fields automatically
  if (status === 'shipped')   update.shipped_at   = new Date().toISOString()
  if (status === 'delivered') update.delivered_at = new Date().toISOString()
  if (status === 'cancelled') update.cancelled_at = new Date().toISOString()

  const { error } = await supabase.from('orders').update(update).eq('id', orderId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/orders')
  return { success: true, message: `Order updated to "${status}".` }
}

// ─────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────

export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  // Prevent de-admining yourself
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) return { success: false, error: 'You cannot change your own role.' }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/users')
  return { success: true, message: `User role updated to "${role}".` }
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) return { success: false, error: 'You cannot deactivate yourself.' }

  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/users')
  return { success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.` }
}
