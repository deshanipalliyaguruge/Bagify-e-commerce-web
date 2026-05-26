import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}

/**
 * Shared wrapper card for all auth forms.
 */
export function AuthCard({ title, description, children, className, footer }: AuthCardProps) {
  return (
    <Card className={cn('w-full max-w-md shadow-xl', className)}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {footer && <div className="mt-2">{footer}</div>}
      </CardContent>
    </Card>
  )
}
