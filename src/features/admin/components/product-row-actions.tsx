'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Eye, EyeOff, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  toggleProductActiveAction,
  toggleProductFeaturedAction,
} from '@/features/admin/actions/admin.actions'
import type { AdminProduct } from '@/features/admin/types/admin.types'

interface ProductRowActionsProps {
  product: AdminProduct
}

export function ProductRowActions({ product }: ProductRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleToggleActive() {
    startTransition(async () => {
      await toggleProductActiveAction(product.id, !product.is_active)
      setOpen(false)
    })
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      await toggleProductFeaturedAction(product.id, !product.is_featured)
      setOpen(false)
    })
  }

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="Product actions"
        disabled={isPending}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-8 w-44 rounded-lg border bg-popover shadow-md">
            <div className="flex flex-col py-1 text-sm">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit product
              </Link>
              <button
                type="button"
                onClick={handleToggleActive}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                {product.is_active
                  ? <><EyeOff className="h-3.5 w-3.5" /> Deactivate</>
                  : <><Eye className="h-3.5 w-3.5" /> Activate</>
                }
              </button>
              <button
                type="button"
                onClick={handleToggleFeatured}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                {product.is_featured
                  ? <><StarOff className="h-3.5 w-3.5" /> Unfeature</>
                  : <><Star className="h-3.5 w-3.5" /> Feature</>
                }
              </button>
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <Eye className="h-3.5 w-3.5" />
                View in store
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
