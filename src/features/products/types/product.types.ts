import type { Product, ProductImage, ProductVariant, Category, ProductWithImage } from '@/types/database'

/** Product with images and variants — used on detail page */
export type ProductFull = Product & {
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  categories: Category | null
}

/** Product card data — minimal fields for listing */
export type ProductCard = ProductWithImage & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
}

/** Parsed, validated filter state from URL search params */
export type ProductFilters = {
  q: string
  category: string
  sort: SortOption
  page: number
  minPrice?: number
  maxPrice?: number
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
]

/** Result from getProducts() */
export type ProductListResult = {
  products: ProductCard[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
