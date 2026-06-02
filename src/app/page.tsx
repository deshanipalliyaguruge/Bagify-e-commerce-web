import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { getFeaturedProducts, getActiveCategories } from '@/features/products/queries/product.queries'
import { ProductCard } from '@/features/products/components/product-card'
import { buttonVariants } from '@/components/ui/button'
import { APP_CONFIG, ROUTES } from '@/config/app'
import { cn } from '@/lib/utils'

// ── Cache revalidation — home changes rarely ──────────────────────
export const revalidate = 300 // 5 minutes

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Premium Bags & Accessories`,
  description: APP_CONFIG.description,
  openGraph: {
    title:       `${APP_CONFIG.name} — Premium Bags & Accessories`,
    description: APP_CONFIG.description,
    type:        'website',
  },
}

// ── Trust bar items ───────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Truck,       label: 'Free shipping',     sub: 'On orders over $50' },
  { icon: ShieldCheck, label: 'Secure checkout',   sub: 'SSL encrypted' },
  { icon: RefreshCw,   label: '30-day returns',    sub: 'Hassle-free' },
  { icon: Star,        label: 'Premium quality',   sub: 'Curated collections' },
] as const

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Decorative gradient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto flex flex-col items-center px-4 py-24 text-center md:py-36">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            New arrivals — Spring 2026 collection
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Carry your world in{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              style
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-zinc-300 md:text-lg">
            {APP_CONFIG.description} Designed to last, built to impress.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.shop} className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.shop}?sort=newest`}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white')}
            >
              New arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-5">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={ROUTES.category(cat.slug)}
                className="group relative flex h-28 items-end overflow-hidden rounded-2xl border bg-gradient-to-br from-muted to-muted/50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="relative z-10 text-sm font-semibold group-hover:text-primary transition-colors">
                  {cat.name}
                  <ArrowRight className="ml-1 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ─────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
            <Link
              href={ROUTES.shop}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1')}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(featuredProducts as unknown as Array<{
              id: string; name: string; slug: string; price: number
              compare_at_price: number | null; average_rating: number | null
              review_count: number; primary_image_path: string | null
              primary_image_alt: string | null; is_featured: boolean
            }>).map((product, i) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                averageRating={product.average_rating}
                reviewCount={product.review_count}
                primaryImagePath={product.primary_image_path}
                primaryImageAlt={product.primary_image_alt}
                isFeatured={product.is_featured}
                priority={i < 4}  // LCP: prioritise first row
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
