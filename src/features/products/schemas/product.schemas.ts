import { z } from 'zod'

export const productFiltersSchema = z.object({
  q: z.string().default(''),
  category: z.string().default(''),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
})

export type RawSearchParams = Record<string, string | string[] | undefined>

/**
 * Parse and validate raw URL searchParams into typed ProductFilters.
 * Always returns a valid object — invalid values fall back to defaults.
 */
export function parseProductFilters(raw: RawSearchParams) {
  const flattened = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  )
  const result = productFiltersSchema.safeParse(flattened)
  return result.success ? result.data : productFiltersSchema.parse({})
}
