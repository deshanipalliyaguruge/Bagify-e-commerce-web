import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="mb-8 h-8 w-36" />
      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-1 flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-7 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="mt-4 h-10 w-full rounded-lg" />
        </div>
        {/* Order summary */}
        <div className="lg:col-span-2 space-y-3 rounded-xl border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Skeleton className="mt-2 h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
