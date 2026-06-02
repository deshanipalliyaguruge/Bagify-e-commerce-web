import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// Column definition
// ─────────────────────────────────────────────────────────────────

export type Column<T> = {
  key:       keyof T | string
  header:    string
  className?: string
  render:    (row: T) => React.ReactNode
}

// ─────────────────────────────────────────────────────────────────
// DataTable
// ─────────────────────────────────────────────────────────────────

interface DataTableProps<T> {
  columns:   Column<T>[]
  data:      T[]
  keyField:  keyof T
  emptyText?: string
}

/**
 * Generic, type-safe table used across all admin sections.
 * Horizontally scrollable on mobile.
 */
export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyText = 'No records found.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="transition-colors hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('px-4 py-3 align-middle', col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
