'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true after the component has mounted on the client.
 * Use this to prevent hydration mismatches for client-only rendering.
 *
 * @example
 * const mounted = useMounted()
 * if (!mounted) return null
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
