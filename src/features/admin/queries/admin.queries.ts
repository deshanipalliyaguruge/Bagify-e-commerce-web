import { createClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/config/app'
import type {
  AdminStats,
  AdminProduct,
  AdminProductFilters,
  AdminOrder,
  AdminOrderFilters,
  AdminUser,
  AdminUserFilters,
  PaginatedResult,
} from '@/features/admin/types/admin.types'

const PAGE_SIZE = PAGINATION.defaultPageSize

// ─────────────────────────────────────────────────────────────────
// Analytics / Stats
// ─────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sixtyDaysAgo  = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: revenueData },
    { count: totalOrders },
    { count: prevOrders },
    { count: totalProducts },
    { count: totalCustomers },
  ] = await Promise.all([
    // Revenue for current + previous 30-day windows
    supabase
      .from('orders')
      .select('total_amount, created_at')
      .neq('status', 'cancelled')
      .gte('created_at', sixtyDaysAgo),

    // Current 30-day orders
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo)
      .neq('status', 'cancelled'),

    // Previous 30-day orders
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo)
      .lt('created_at', thirtyDaysAgo)
      .neq('status', 'cancelled'),

    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  const rows = revenueData ?? []
  const currentRevenue = rows
    .filter((r) => r.created_at >= thirtyDaysAgo)
    .reduce((s, r) => s + (r.total_amount ?? 0), 0)
  const prevRevenue = rows
    .filter((r) => r.created_at < thirtyDaysAgo)
    .reduce((s, r) => s + (r.total_amount ?? 0), 0)

  const revenueChange =
    prevRevenue === 0 ? 100 : Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
  const ordersChange =
    (prevOrders ?? 0) === 0
      ? 100
      : Math.round((((totalOrders ?? 0) - (prevOrders ?? 0)) / (prevOrders ?? 0)) * 100)

  return {
    totalRevenue:   currentRevenue,
    totalOrders:    totalOrders ?? 0,
    totalProducts:  totalProducts ?? 0,
    totalCustomers: totalCustomers ?? 0,
    revenueChange,
    ordersChange,
  }
}

// ─────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────

export async function getAdminProducts(
  filters: AdminProductFilters,
): Promise<PaginatedResult<AdminProduct>> {
  const supabase = await createClient()
  const from = (filters.page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('id, name, slug, sku, price, compare_at_price, stock_quantity, is_active, is_featured, review_count, average_rating, created_at, categories(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.q)               query = query.ilike('name', `%${filters.q}%`)
  if (filters.status === 'active')   query = query.eq('is_active', true)
  if (filters.status === 'inactive') query = query.eq('is_active', false)

  const { data, count, error } = await query
  if (error) return { data: [], total: 0, page: filters.page, pageSize: PAGE_SIZE, totalPages: 0 }

  const products = (data ?? []).map((p) => ({
    ...p,
    category_name: (p.categories as { name: string } | null)?.name ?? null,
  })) as unknown as AdminProduct[]

  const total = count ?? 0
  return { data: products, total, page: filters.page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }
}

// ─────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────

export async function getAdminOrders(
  filters: AdminOrderFilters,
): Promise<PaginatedResult<AdminOrder>> {
  const supabase = await createClient()
  const from = (filters.page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('orders')
    .select(
      'id, order_number, status, payment_status, payment_method, total_amount, shipping_name, shipping_city, shipping_country, created_at, profiles(email), order_items(id)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.q && filters.q.length > 0)
    query = query.ilike('order_number', `%${filters.q}%`)
  if (filters.status !== 'all')
    query = query.eq('status', filters.status)

  const { data, count, error } = await query
  if (error) return { data: [], total: 0, page: filters.page, pageSize: PAGE_SIZE, totalPages: 0 }

  const orders = (data ?? []).map((o) => ({
    id:               o.id,
    order_number:     o.order_number,
    status:           o.status,
    payment_status:   o.payment_status,
    payment_method:   o.payment_method,
    total_amount:     o.total_amount,
    shipping_name:    o.shipping_name,
    shipping_city:    o.shipping_city,
    shipping_country: o.shipping_country,
    created_at:       o.created_at,
    customer_email:   (o.profiles as { email: string } | null)?.email ?? null,
    item_count:       Array.isArray(o.order_items) ? o.order_items.length : 0,
  })) as AdminOrder[]

  const total = count ?? 0
  return { data: orders, total, page: filters.page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }
}

// ─────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────

export async function getAdminUsers(
  filters: AdminUserFilters,
): Promise<PaginatedResult<AdminUser>> {
  const supabase = await createClient()
  const from = (filters.page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.q)              query = query.ilike('email', `%${filters.q}%`)
  if (filters.role !== 'all') query = query.eq('role', filters.role)

  const { data, count, error } = await query
  if (error) return { data: [], total: 0, page: filters.page, pageSize: PAGE_SIZE, totalPages: 0 }

  const total = count ?? 0
  return { data: (data ?? []) as AdminUser[], total, page: filters.page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }
}

// ─────────────────────────────────────────────────────────────────
// Recent orders (for dashboard overview — no pagination)
// ─────────────────────────────────────────────────────────────────

export async function getRecentOrders(limit = 5): Promise<AdminOrder[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, payment_status, payment_method, total_amount, shipping_name, shipping_city, shipping_country, created_at, profiles(email), order_items(id)',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((o) => ({
    id:               o.id,
    order_number:     o.order_number,
    status:           o.status,
    payment_status:   o.payment_status,
    payment_method:   o.payment_method,
    total_amount:     o.total_amount,
    shipping_name:    o.shipping_name,
    shipping_city:    o.shipping_city,
    shipping_country: o.shipping_country,
    created_at:       o.created_at,
    customer_email:   (o.profiles as { email: string } | null)?.email ?? null,
    item_count:       Array.isArray(o.order_items) ? o.order_items.length : 0,
  })) as AdminOrder[]
}
