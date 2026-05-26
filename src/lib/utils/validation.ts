/**
 * Validation utility helpers.
 * Wraps common Zod validation patterns for reuse across features.
 */
import { z } from 'zod'

/**
 * Safely parses data against a Zod schema.
 * Returns typed result or null + errors on failure.
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

/**
 * Formats a ZodError into a flat key→message record
 * for use with form error display.
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.')
    if (key && !acc[key]) {
      acc[key] = issue.message
    }
    return acc
  }, {})
}

// ============================================================
// Shared reusable schema primitives
// ============================================================

export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''))
