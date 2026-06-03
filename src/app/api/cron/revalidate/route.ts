import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * GET /api/cron/revalidate
 *
 * Called by the Vercel cron job every hour (configured in vercel.json).
 * Flushes all tagged ISR caches so stale data doesn't persist indefinitely.
 *
 * Security: validated via CRON_SECRET header set by Vercel.
 */
export async function GET(request: Request) {
  // Validate the cron secret
  const authHeader = request.headers.get('authorization')
  const expected   = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tags = ['categories', 'featured-products']

  try {
    for (const tag of tags) {
      revalidateTag(tag, 'max')
    }

    return NextResponse.json({
      ok:         true,
      revalidated: tags,
      timestamp:  new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed', detail: String(error) },
      { status: 500 },
    )
  }
}
