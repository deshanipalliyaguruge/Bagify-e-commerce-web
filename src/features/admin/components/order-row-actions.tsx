'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOrderStatusAction } from '@/features/admin/actions/admin.actions'
import type { AdminOrder } from '@/features/admin/types/admin.types'
import type { OrderStatus } from '@/types/database'

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirm order',
  processing: 'Mark processing',
  shipped:    'Mark shipped',
  delivered:  'Mark delivered',
  cancelled:  'Cancel order',
  refunded:   'Refunded',
}

interface OrderRowActionsProps {
  order: AdminOrder
}

export function OrderRowActions({ order }: OrderRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const nextStatuses = STATUS_TRANSITIONS[order.status] ?? []

  function handleStatusChange(status: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatusAction(order.id, status)
      setOpen(false)
    })
  }

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="Order actions"
        disabled={isPending}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-8 w-44 rounded-lg border bg-popover shadow-md">
            <div className="flex flex-col py-1 text-sm">
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View detail
              </Link>

              {nextStatuses.length > 0 && (
                <div className="my-1 border-t" />
              )}

              {nextStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent ${
                    status === 'cancelled' ? 'text-destructive' : ''
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
