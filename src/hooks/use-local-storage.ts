'use client'

import { useEffect, useState } from 'react'

/**
 * Reads and writes a value to localStorage, with SSR safety.
 * Falls back gracefully when localStorage is unavailable.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T)
      }
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}"`, error)
    }
  }, [key])

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`useLocalStorage: error setting key "${key}"`, error)
    }
  }

  return [storedValue, setValue]
}
