'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOutAction } from '@/features/auth/actions/auth.actions'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline' | 'destructive'
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({
  className,
  variant = 'ghost',
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setIsLoading(true)
    try {
      await signOutAction()
    } catch {
      // signOutAction calls redirect() which throws — this is expected
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn('gap-2', className)}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children ?? (isLoading ? 'Signing out…' : 'Sign out')}
    </Button>
  )
}
