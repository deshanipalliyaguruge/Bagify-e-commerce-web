'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantityControlProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  onRemove?: () => void
  maxQuantity?: number
  disabled?: boolean
  className?: string
}

/**
 * Inline +/− quantity control used in both the cart drawer and the cart page.
 */
export function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  onRemove,
  maxQuantity,
  disabled,
  className,
}: QuantityControlProps) {
  const atMax = maxQuantity !== undefined && quantity >= maxQuantity

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={quantity === 1 && onRemove ? onRemove : onDecrease}
        disabled={disabled}
        aria-label={quantity === 1 ? 'Remove item' : 'Decrease quantity'}
      >
        {quantity === 1 && onRemove ? (
          <Trash2 className="h-3 w-3" />
        ) : (
          <Minus className="h-3 w-3" />
        )}
      </Button>

      <span className="w-7 text-center text-sm font-medium tabular-nums">{quantity}</span>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={onIncrease}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
