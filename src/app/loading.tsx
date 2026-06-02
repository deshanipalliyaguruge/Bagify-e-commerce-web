import { Skeleton } from '@/components/ui/skeleton'

// Home page loading: hero + trust bar + featured grid
export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <div className="bg-muted/50 py-24 md:py-36">
        <div className="container mx-auto flex flex-col items-center gap-5 px-4">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-12 w-3/4 max-w-lg" />
          <Skeleton className="h-5 w-2/3 max-w-md" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-b bg-muted/30 py-5">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured grid */}
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-6 h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="flex flex-col gap-2 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-1 h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
