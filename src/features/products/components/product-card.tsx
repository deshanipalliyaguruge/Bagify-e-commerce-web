import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { getImageUrl } from '@/lib/utils/helpers'
import { ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'

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
    <Link
      href={ROUTES.product(slug)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={getImageUrl(primaryImagePath)}
          alt={primaryImageAlt ?? name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
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
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{name}</h3>

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
          <span className="text-sm font-semibold">{formatCurrency(price / 100)}</span>
          {isOnSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(compareAtPrice / 100)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
