import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bagify.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/callback', '/checkout', '/orders'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
