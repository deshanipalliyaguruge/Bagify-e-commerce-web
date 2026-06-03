/**
 * Environment variable validation.
 * Runs at build time AND server startup — fails fast if required vars are missing.
 * Import this at the top of any file that needs validated env access.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, ...)
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Add it to .env.local (dev) or Vercel Dashboard (prod).`,
    )
  }
  return value
}

// ── Validated environment object ─────────────────────────────────
export const env = {
  // Supabase (public — safe for both server and client bundles)
  NEXT_PUBLIC_SUPABASE_URL:          requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:     requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: requireEnv('NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET'),

  // App (public)
  NEXT_PUBLIC_APP_URL:  requireEnv('NEXT_PUBLIC_APP_URL'),
  NEXT_PUBLIC_APP_NAME: requireEnv('NEXT_PUBLIC_APP_NAME'),

  // Server-only secrets (these will be undefined in the browser bundle)
  // Access only from Server Components, Server Actions, Route Handlers, and middleware.
  get SUPABASE_SERVICE_ROLE_KEY() {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  },

  get CRON_SECRET() {
    return process.env.CRON_SECRET ?? ''
  },

  // Environment
  isProd:     process.env.NODE_ENV === 'production',
  isDev:      process.env.NODE_ENV === 'development',
  isTest:     process.env.NODE_ENV === 'test',
} as const
