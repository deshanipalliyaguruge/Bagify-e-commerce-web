import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Star, Package, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductImageGallery } from '@/features/products/components/product-image-gallery'
import { ProductCard } from '@/features/products/components/product-card'
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button'
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from '@/features/products/queries/product.queries'
import { formatCurrency } from '@/lib/utils/format'
import { getImageUrl } from '@/lib/utils/helpers'
import { ROUTES, APP_CONFIG } from '@/config/app'

// ── params is a Promise in Next.js 15 ───────────────────────────
type ProductDetailPageProps = {
  params: Promise<{ slug: string }>
}

// ── generateStaticParams for ISR ─────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

// ── Dynamic SEO metadata ──────────────────────────────────────────
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: `Product not found — ${APP_CONFIG.name}` }
  }

  const primaryImage = product.product_images.find((img) => img.is_primary)

  return {
    title: product.meta_title ?? `${product.name} — ${APP_CONFIG.name}`,
    description: product.meta_description ?? product.short_description ?? product.description ?? '',
    openGraph: {
      title: product.name,
      description: product.short_description ?? product.description ?? '',
      images: primaryImage
        ? [{ url: getImageUrl(primaryImage.storage_path), alt: primaryImage.alt_text ?? product.name }]
        : [],
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const related = await getRelatedProducts(product.id, product.category_id)

  const isOnSale =
    product.compare_at_price !== null &&
    product.compare_at_price !== undefined &&
    product.compare_at_price > product.price

  const discountPct = isOnSale
    ? Math.round((1 - product.price / (product.compare_at_price ?? product.price)) * 100)
    : 0

  const inStock = product.stock_quantity > 0
  const isLowStock = inStock && product.stock_quantity <= product.low_stock_threshold

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={ROUTES.home} className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={ROUTES.shop} className="hover:text-foreground">Shop</Link>
        {product.categories && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={ROUTES.category(product.categories.slug)}
              className="hover:text-foreground"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ProductImageGallery images={product.product_images} productName={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.is_featured && <Badge>Featured</Badge>}
            {isOnSale && <Badge variant="destructive">Sale -{discountPct}%</Badge>}
            {!inStock && <Badge variant="outline">Out of Stock</Badge>}
            {isLowStock && inStock && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                Only {product.stock_quantity} left
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>

          {/* Rating */}
          {product.average_rating !== null && product.review_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.average_rating ?? 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(product.price / 100)}</span>
            {isOnSale && product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compare_at_price / 100)}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          <Separator />

          {/* Stock status */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {inStock ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-destructive font-medium">Out of Stock</span>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton
            product={{
              productId: product.id,
              variantId: null,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imagePath: product.product_images.find((img) => img.is_primary)?.storage_path ?? null,
              maxQuantity: product.stock_quantity,
            }}
            disabled={!inStock}
            size="lg"
            className="w-full"
          />

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Full description */}
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(related as unknown as Array<Record<string, unknown>>).map((p) => (
              <ProductCard
                key={p['id'] as string}
                id={p['id'] as string}
                name={p['name'] as string}
                slug={p['slug'] as string}
                price={p['price'] as number}
                compareAtPrice={p['compare_at_price'] as number | null}
                averageRating={p['average_rating'] as number | null}
                reviewCount={p['review_count'] as number}
                primaryImagePath={p['primary_image_path'] as string | null}
                primaryImageAlt={p['primary_image_alt'] as string | null}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
