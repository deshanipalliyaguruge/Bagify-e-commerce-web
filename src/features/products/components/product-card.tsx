import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { getImageUrl } from '@/lib/utils/helpers'
import { ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  averageRating?: number | null
  reviewCount?: number
  primaryImagePath?: string | null
  primaryImageAlt?: string | null
  isFeatured?: boolean
  priority?: boolean        // true for above-fold images (LCP)
  className?: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  averageRating,
  reviewCount = 0,
  primaryImagePath,
  primaryImageAlt,
  isFeatured,
  priority = false,
  className,
}: ProductCardProps) {
  const isOnSale = compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice > price
  const discountPct = isOnSale
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={ROUTES.product(slug)} className="absolute inset-0" aria-label={`View ${name}`}>
          <Image
            src={getImageUrl(primaryImagePath)}
            alt={primaryImageAlt ?? name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        </Link>
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isFeatured && (
            <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
          )}
          {isOnSale && (
            <Badge variant="destructive" className="text-xs">
              -{discountPct}%
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={ROUTES.product(slug)} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{name}</h3>
        </Link>

        {/* Rating */}
        {averageRating !== null && averageRating !== undefined && reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold">{formatCurrency(price / 100)}</span>
          {isOnSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(compareAtPrice / 100)}
            </span>
          )}
        </div>
        <AddToCartButton
          product={{ productId: id, name, slug, price, imagePath: primaryImagePath }}
          size="sm"
          className="mt-2 h-9 w-full"
        />
      </div>
    </article>
  )
}
