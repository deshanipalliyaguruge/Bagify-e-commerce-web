import { ProductGridSkeleton } from '@/features/products/components/product-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-9 w-24" />
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-56 lg:flex-shrink-0">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-5 flex gap-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-44" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  )
}
