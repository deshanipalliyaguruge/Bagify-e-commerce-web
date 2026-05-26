import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ============================================================
  // Images
  // ============================================================
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ============================================================
  // Security headers
  // ============================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // ============================================================
  // Experimental
  // ============================================================
  experimental: {
    // Uncomment when using React 19 form actions at scale
    // serverActions: { allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? ''] },
  },
}

export default nextConfig
