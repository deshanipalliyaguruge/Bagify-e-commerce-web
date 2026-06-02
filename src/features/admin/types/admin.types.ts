import type { Order, Profile, Product, OrderStatus } from '@/types/database'

// ── Analytics ─────────────────────────────────────────────────────

export type AdminStats = {
  totalRevenue:    number   // cents
  totalOrders:     number
  totalProducts:   number
  totalCustomers:  number
  revenueChange:   number   // % vs last 30 days
  ordersChange:    number
}

export type RevenueByDay = {
  date:    string
  revenue: number   // cents
  orders:  number
}

// ── Products ──────────────────────────────────────────────────────

export type AdminProduct = Pick<
  Product,
  | 'id' | 'name' | 'slug' | 'sku' | 'price' | 'compare_at_price'
  | 'stock_quantity' | 'is_active' | 'is_featured'
  | 'review_count' | 'average_rating' | 'created_at'
> & {
  category_name: string | null
}

export type AdminProductFilters = {
  q:        string
  status:   'all' | 'active' | 'inactive'
  page:     number
}

// ── Orders ────────────────────────────────────────────────────────

export type AdminOrder = Pick<
  Order,
  | 'id' | 'order_number' | 'status' | 'payment_status' | 'payment_method'
  | 'total_amount' | 'shipping_name' | 'shipping_city' | 'shipping_country'
  | 'created_at'
> & {
  customer_email: string | null
  item_count:     number
}

export type AdminOrderFilters = {
  q:      string
  status: OrderStatus | 'all'
  page:   number
}

// ── Users ─────────────────────────────────────────────────────────

export type AdminUser = Pick<
  Profile,
  'id' | 'email' | 'full_name' | 'role' | 'is_active' | 'created_at'
>

export type AdminUserFilters = {
  q:    string
  role: 'all' | 'customer' | 'admin'
  page: number
}

// ── Shared ────────────────────────────────────────────────────────

export type PaginatedResult<T> = {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

export type AdminActionResult =
  | { success: true;  message: string }
  | { success: false; error: string }
