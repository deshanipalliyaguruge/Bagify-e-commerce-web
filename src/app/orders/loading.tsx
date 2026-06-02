import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
