/**
 * Application-wide configuration constants.
 * Use this file for any magic numbers, strings, or settings
 * that should be easy to update in one place.
 */

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Bagify',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  description: 'Premium bags & accessories — curated for the modern lifestyle.',
  defaultCurrency: 'USD',
  defaultLocale: 'en-US',
} as const

export const PAGINATION = {
  defaultPageSize: 12,
  maxPageSize: 48,
} as const

export const STORAGE = {
  bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'bagify-products',
  maxFileSizeMB: 5,
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const

export const ROUTES = {
  home: '/',
  shop: '/shop',
  product: (slug: string) => `/products/${slug}`,
  category: (slug: string) => `/shop?category=${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  account: '/account',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    callback: '/auth/callback',
  },
  admin: '/admin',
} as const
