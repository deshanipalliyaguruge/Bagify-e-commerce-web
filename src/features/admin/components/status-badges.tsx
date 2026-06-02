import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types/database'

// ── Order status ──────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

// ── Payment status ────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  paid:     'bg-green-100 text-green-800',
  failed:   'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
}

interface OrderStatusBadgeProps { status: OrderStatus }
interface PaymentStatusBadgeProps { status: PaymentStatus }

const badgeBase = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize'

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={cn(badgeBase, ORDER_STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground')}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={cn(badgeBase, PAYMENT_STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  )
}

// ── Stock badge ───────────────────────────────────────────────────

export function StockBadge({ qty, threshold = 5 }: { qty: number; threshold?: number }) {
  if (qty === 0)           return <span className={cn(badgeBase, 'bg-red-100 text-red-800')}>Out of stock</span>
  if (qty <= threshold)    return <span className={cn(badgeBase, 'bg-amber-100 text-amber-800')}>Low ({qty})</span>
  return <span className={cn(badgeBase, 'bg-green-100 text-green-800')}>{qty} in stock</span>
}

// ── Active badge ──────────────────────────────────────────────────

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn(badgeBase, active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
