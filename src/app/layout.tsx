import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/features/cart/components/cart-provider'
import { APP_CONFIG } from '@/config/app'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s — ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  metadataBase: new URL(APP_CONFIG.url),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
