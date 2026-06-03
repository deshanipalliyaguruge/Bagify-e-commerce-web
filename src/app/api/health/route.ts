import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health
 *
 * Health-check endpoint for Vercel's uptime monitoring or external services
 * (e.g. UptimeRobot, Better Uptime).
 *
 * Returns 200 when the app + DB connection are healthy.
 * Returns 503 when the DB is unreachable.
 */
export async function GET() {
  const start = Date.now()

  try {
    const supabase = await createClient()
    // Cheapest possible query — just a scalar, no row fetch
    const { error } = await supabase.from('categories').select('id').limit(1)

    if (error) throw error

    return NextResponse.json({
      status:  'ok',
      db:      'connected',
      latency: `${Date.now() - start}ms`,
      version: process.env.NEXT_PUBLIC_APP_NAME ?? 'Bagify',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status:  'error',
        db:      'unreachable',
        detail:  String(error),
        latency: `${Date.now() - start}ms`,
      },
      { status: 503 },
    )
  }
}
