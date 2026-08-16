import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw, PackagePlus, Search } from 'lucide-react'
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
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        {/* Decorative gradient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-rose-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="container relative mx-auto flex min-h-[560px] flex-col items-center justify-center px-4 py-20 text-center md:py-28">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            New arrivals — Spring 2026 collection
          </span>
          <h1 className="max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Carry your world in{' '}
            <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              style
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-300 md:text-lg">
            {APP_CONFIG.description} Designed to last, built to impress.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.shop} className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 bg-white px-5 text-zinc-950 hover:bg-zinc-200')}>
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.shop}?sort=newest`}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white')}
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

      {featuredProducts.length === 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-3xl border bg-gradient-to-br from-card to-muted/40 px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <PackagePlus className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">The collection is being prepared</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              There are no featured products yet. Browse the full catalogue, or add products from the admin dashboard if you manage this store.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.shop} className={cn(buttonVariants(), 'gap-2')}><Search />Browse shop</Link>
              <Link href="/admin/products/new" className={buttonVariants({ variant: 'outline' })}>Add a product</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
