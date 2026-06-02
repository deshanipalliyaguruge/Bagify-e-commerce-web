'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/hooks/use-cart'
import { cn } from '@/lib/utils'
import type { AddToCartInput } from '@/features/cart/hooks/use-cart'

interface AddToCartButtonProps {
  product: Omit<AddToCartInput, 'quantity'>
  quantity?: number
  disabled?: boolean
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

/**
 * "Add to cart" button for product cards and detail pages.
 *
 * Shows:
 *  - Default: "Add to cart"
 *  - Adding: spinner
 *  - Briefly after add: green checkmark
 *  - Already in cart: "In cart ✓"
 */
export function AddToCartButton({
  product,
  quantity = 1,
  disabled,
  className,
  size = 'default',
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const [state, setState] = useState<'idle' | 'adding' | 'added'>('idle')

  const alreadyInCart = isInCart(product.productId, product.variantId)

  async function handleAdd() {
    if (state !== 'idle') return
    setState('adding')

    await addToCart({ ...product, quantity })

    setState('added')
    setTimeout(() => setState('idle'), 2000)
  }

  const isDisabled = disabled || state === 'adding' || (alreadyInCart && state === 'idle')

  return (
    <Button
      onClick={handleAdd}
      disabled={isDisabled}
      size={size}
      className={cn(
        'gap-2 transition-all',
        alreadyInCart && state === 'idle' && 'bg-green-600 text-white hover:bg-green-700',
        state === 'added' && 'bg-green-600 text-white',
        className,
      )}
      aria-label={alreadyInCart ? 'Already in cart' : 'Add to cart'}
    >
      {state === 'adding' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding…
        </>
      ) : state === 'added' || alreadyInCart ? (
        <>
          <Check className="h-4 w-4" />
          {alreadyInCart ? 'In cart' : 'Added!'}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </>
      )}
    </Button>
  )
}
