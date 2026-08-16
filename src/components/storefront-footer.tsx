import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { APP_CONFIG, ROUTES } from '@/config/app'

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t bg-zinc-950 text-zinc-300">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold text-white"><ShoppingBag className="size-4" />{APP_CONFIG.name}</div>
          <p className="mt-2 text-sm text-zinc-400">Premium bags made for everyday life.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer navigation">
          <Link href={ROUTES.shop} className="hover:text-white">Shop</Link>
          <Link href={ROUTES.cart} className="hover:text-white">Cart</Link>
          <Link href={ROUTES.orders} className="hover:text-white">Orders</Link>
          <Link href={ROUTES.auth.login} className="hover:text-white">Account</Link>
        </nav>
      </div>
    </footer>
  )
}
