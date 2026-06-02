import { Skeleton } from '@/components/ui/skeleton'

// Product detail loading: matches 2-col layout (gallery | info)
export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
