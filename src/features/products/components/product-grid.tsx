import { ProductCard } from './product-card'
import type { ProductCard as ProductCardType } from '@/features/products/types/product.types'

interface ProductGridProps {
  products: ProductCardType[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
        <p className="text-base font-medium">No products found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 min-[460px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
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
        />
      ))}
    </div>
  )
}
