import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/features/cart/components/cart-provider'
import { APP_CONFIG } from '@/config/app'
import { StorefrontShell } from '@/components/storefront-shell'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',   // FOUT instead of FOIT — text visible faster
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// ── Viewport (separate export required by Next.js 15) ─────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// ── Site-wide metadata defaults ───────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default:  APP_CONFIG.name,
    template: `%s — ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: ['bags', 'accessories', 'handbags', 'totes', 'leather', 'premium', 'fashion'],
  authors: [{ name: APP_CONFIG.name, url: APP_CONFIG.url }],
  creator: APP_CONFIG.name,

  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         APP_CONFIG.url,
    siteName:    APP_CONFIG.name,
    title:       APP_CONFIG.name,
    description: APP_CONFIG.description,
  },

  twitter: {
    card:        'summary_large_image',
    title:       APP_CONFIG.name,
    description: APP_CONFIG.description,
  },

  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-image-preview': 'large',
      'max-snippet':     -1,
    },
  },

  // PWA manifest — create /public/manifest.json to activate
  // manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          CartProvider activates the Zustand ↔ Supabase sync side-effect.
          It is a Client Component boundary but renders no markup.
        */}
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  )
}
