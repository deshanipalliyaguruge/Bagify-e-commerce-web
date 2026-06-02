'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  updateUserRoleAction,
  toggleUserActiveAction,
} from '@/features/admin/actions/admin.actions'
import type { AdminUser } from '@/features/admin/types/admin.types'

interface UserRowActionsProps {
  user: AdminUser
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRoleToggle() {
    startTransition(async () => {
      const newRole = user.role === 'admin' ? 'customer' : 'admin'
      await updateUserRoleAction(user.id, newRole)
      setOpen(false)
    })
  }

  function handleActiveToggle() {
    startTransition(async () => {
      await toggleUserActiveAction(user.id, !user.is_active)
      setOpen(false)
    })
  }

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="User actions"
        disabled={isPending}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-8 w-48 rounded-lg border bg-popover shadow-md">
            <div className="flex flex-col py-1 text-sm">
              <button
                type="button"
                onClick={handleRoleToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                {user.role === 'admin'
                  ? <><ShieldOff className="h-3.5 w-3.5" /> Remove admin role</>
                  : <><ShieldCheck className="h-3.5 w-3.5" /> Make admin</>
                }
              </button>
              <button
                type="button"
                onClick={handleActiveToggle}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent ${
                  user.is_active ? 'text-destructive' : ''
                }`}
              >
                {user.is_active
                  ? <><UserX className="h-3.5 w-3.5" /> Deactivate user</>
                  : <><UserCheck className="h-3.5 w-3.5" /> Activate user</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
