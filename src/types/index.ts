/**
 * Shared global types used across the application.
 * Feature-specific types belong in their own feature/types/ file.
 */

// ============================================================
// API / Response types
// ============================================================

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// Common UI types
// ============================================================

export type Status = 'idle' | 'loading' | 'success' | 'error'

export type SortOrder = 'asc' | 'desc'

export type Option = {
  label: string
  value: string
}

// ============================================================
// Navigation
// ============================================================

export type NavItem = {
  label: string
  href: string
  icon?: string
  children?: NavItem[]
}

// ============================================================
// Image
// ============================================================

export type ImageAsset = {
  url: string
  alt: string
  width?: number
  height?: number
}
