import { Skeleton } from '@/components/ui/skeleton'

// Reusable admin table loading skeleton
function AdminTableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Per-page variants
export function AdminProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <AdminTableSkeleton rows={8} cols={7} />
    </div>
  )
}

export function AdminOrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-8 w-72 rounded-lg" />
      </div>
      <AdminTableSkeleton rows={8} cols={8} />
    </div>
  )
}

export function AdminUsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>
      <AdminTableSkeleton rows={8} cols={5} />
    </div>
  )
}
