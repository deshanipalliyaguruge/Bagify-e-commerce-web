import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

/** Authenticated user bundled with their DB profile */
export type AuthUser = {
  user: User
  profile: Profile | null
}

/** Shape returned from all auth server actions */
export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

/** Client-side auth state (useAuth hook) */
export type AuthState = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
}
