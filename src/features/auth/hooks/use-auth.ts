'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import type { AuthState } from '@/features/auth/types/auth.types'

/**
 * Client-side hook for accessing the current auth state.
 * Subscribes to Supabase auth changes and fetches the user's DB profile.
 *
 * Use in Client Components. For Server Components, use getCurrentUser()
 * from @/lib/auth/helpers instead.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data as Profile | null)
    }

    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user: initialUser } }) => {
      setUser(initialUser)
      if (initialUser) {
        await fetchProfile(initialUser.id)
      }
      setIsLoading(false)
    })

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user,
  }
}
