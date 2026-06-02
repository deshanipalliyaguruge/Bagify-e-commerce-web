import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label:    string
  value:    string
  change?:  number   // percentage, positive = up, negative = down
  icon:     React.ReactNode
  accent?:  'blue' | 'green' | 'purple' | 'amber'
}

const ACCENT_CLASSES = {
  blue:   'bg-blue-500/10 text-blue-600',
  green:  'bg-green-500/10 text-green-600',
  purple: 'bg-purple-500/10 text-purple-600',
  amber:  'bg-amber-500/10 text-amber-600',
} as const

export function StatCard({ label, value, change, icon, accent = 'blue' }: StatCardProps) {
  const isUp   = change !== undefined && change > 0
  const isDown = change !== undefined && change < 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', ACCENT_CLASSES[accent])}>
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight">{value}</p>

      {change !== undefined && (
        <p className={cn(
          'flex items-center gap-1 text-xs font-medium',
          isUp ? 'text-green-600' : isDown ? 'text-destructive' : 'text-muted-foreground',
        )}>
          {isUp ? <TrendingUp className="h-3 w-3" /> :
           isDown ? <TrendingDown className="h-3 w-3" /> :
           <Minus className="h-3 w-3" />}
          {Math.abs(change)}% vs last 30 days
        </p>
      )}
    </div>
  )
}
