/**
 * Global TypeScript types for Supabase database tables.
 *
 * ⚠️  This file is a placeholder. Generate the real types from your Supabase project:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 *
 * Or via local Supabase CLI:
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * Once generated, DELETE this placeholder and use the generated file.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      // Tables will be generated here by the Supabase CLI
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
