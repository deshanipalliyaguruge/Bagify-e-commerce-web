import type { NextConfig } from 'next'

// ── Content Security Policy ────────────────────────────────────────
// Restrict what resources the browser can load.
// Supabase domains are explicitly whitelisted for images and API calls.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const ContentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,   // unsafe-eval needed by Next.js dev HMR; tighten in prod with nonce
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https://${supabaseHost}`,
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join('; ')

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Referrer — leak only origin on cross-origin requests
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by an e-commerce site
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Enable HSTS (1 year, include subdomains, preload-ready)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // DNS prefetch for external resources
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  // CSP
  { key: 'Content-Security-Policy',   value: ContentSecurityPolicy },
]

const nextConfig: NextConfig = {
  // ── Images ─────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats:     ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 64, 128, 256, 384],
  },

  // ── Compiler ────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Security & caching headers ──────────────────────────────────
  async headers() {
    return [
      // Security headers on every route
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Long-lived cache for immutable Next.js static chunks
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 24h cache + 7d stale-while-revalidate for optimised images
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // API routes — never cache
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },

  // ── Experimental ────────────────────────────────────────────────
  experimental: {
    serverActions: {
      // 4 MB limit for image upload server actions
      bodySizeLimit: '4mb',
      // Restrict server actions to your own origin in production
      allowedOrigins: process.env.NEXT_PUBLIC_APP_URL
        ? [process.env.NEXT_PUBLIC_APP_URL]
        : [],
    },
  },
}

export default nextConfig
