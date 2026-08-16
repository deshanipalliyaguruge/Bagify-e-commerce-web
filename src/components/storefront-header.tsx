'use client'

import Link from 'next/link'
import { Menu, Package, ShoppingBag, ShoppingCart, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { CartDrawer } from '@/features/cart/components/cart-drawer'
import { LogoutButton } from '@/features/auth/components/logout-button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { buttonVariants } from '@/components/ui/button'
import { APP_CONFIG, ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'

export function StorefrontHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, isAdmin, profile, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 shadow-[0_1px_12px_rgba(35,25,18,0.04)] backdrop-blur-xl">
      <div className="border-b border-border/60 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground">
        Free delivery on orders over $50 · 30-day easy returns
      </div>
      <div className="container mx-auto flex h-18 items-center justify-between px-4">
        <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label={`${APP_CONFIG.name} home`}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="size-4.5" />
          </span>
          <span className="text-lg font-bold tracking-tight">{APP_CONFIG.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <Link href={ROUTES.shop} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Shop
          </Link>
          {isAuthenticated && (
            <Link href={ROUTES.orders} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              My orders
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Manage products
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          {!isLoading && (isAuthenticated ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <span className="max-w-32 truncate px-2 text-sm text-muted-foreground">
                {profile?.full_name ?? profile?.email ?? 'Account'}
              </span>
              <LogoutButton showIcon={false} variant="ghost" />
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link href={ROUTES.auth.login} className={buttonVariants({ variant: 'ghost' })}>Log in</Link>
              <Link href={ROUTES.auth.register} className={buttonVariants()}>Create account</Link>
            </div>
          ))}

          <CartDrawer>
            <span className={cn(buttonVariants({ variant: 'outline' }), 'h-10 cursor-pointer gap-2 px-3')}>
              <ShoppingCart className="size-4.5" />
              <span className="hidden sm:inline">Cart</span>
            </span>
          </CartDrawer>

          <button
            type="button"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t bg-background px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="container mx-auto grid gap-2">
            <Link href={ROUTES.shop} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">Shop all products</Link>
            {isAuthenticated ? (
              <>
                <Link href={ROUTES.orders} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"><Package className="size-4" />My orders</Link>
                {isAdmin && <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">Manage products</Link>}
                <LogoutButton className="justify-start" />
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href={ROUTES.auth.login} className={buttonVariants({ variant: 'outline' })}><UserRound />Log in</Link>
                <Link href={ROUTES.auth.register} className={buttonVariants()}>Create account</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
