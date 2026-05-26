/**
 * Supabase Database Types â€” Bagify E-Commerce
 *
 * Hand-crafted to match supabase/migrations/20260526000001_initial_schema.sql
 *
 * After running migrations against your Supabase project, regenerate this file
 * to ensure it stays in sync:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// =============================================================
// ENUMS
// =============================================================

export type UserRole = 'customer' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'

// =============================================================
// DATABASE TYPE
// =============================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }

      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string | null
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          phone?: string | null
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          full_name?: string
          phone?: string | null
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'addresses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          description: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }

      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number               // cents
          compare_at_price: number | null  // cents
          sku: string | null
          stock_quantity: number
          low_stock_threshold: number
          tags: string[]
          is_featured: boolean
          is_active: boolean
          review_count: number
          average_rating: number | null
          weight_grams: number | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: number
          compare_at_price?: number | null
          sku?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          tags?: string[]
          is_featured?: boolean
          is_active?: boolean
          review_count?: number
          average_rating?: number | null
          weight_grams?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: number
          compare_at_price?: number | null
          sku?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          tags?: string[]
          is_featured?: boolean
          is_active?: boolean
          review_count?: number
          average_rating?: number | null
          weight_grams?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }

      product_images: {
        Row: {
          id: string
          product_id: string
          storage_path: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_path: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage_path?: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }

      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          value: string
          sku: string | null
          price_override: number | null  // cents; null = use product.price
          stock_quantity: number
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          value: string
          sku?: string | null
          price_override?: number | null
          stock_quantity?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          value?: string
          sku?: string | null
          price_override?: number | null
          stock_quantity?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }

      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'carts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number  // cents, snapshotted
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cart_items_cart_id_fkey'
            columns: ['cart_id']
            isOneToOne: false
            referencedRelation: 'carts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cart_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cart_items_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
        ]
      }

      wishlists: {
        Row: {
          id: string
          user_id: string
          name: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wishlists_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      wishlist_items: {
        Row: {
          id: string
          wishlist_id: string
          product_id: string
          added_at: string
        }
        Insert: {
          id?: string
          wishlist_id: string
          product_id: string
          added_at?: string
        }
        Update: {
          id?: string
          wishlist_id?: string
          product_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_wishlist_id_fkey'
            columns: ['wishlist_id']
            isOneToOne: false
            referencedRelation: 'wishlists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wishlist_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }

      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: OrderStatus
          payment_status: PaymentStatus
          payment_method: PaymentMethod | null
          subtotal: number        // cents
          discount_amount: number // cents
          shipping_amount: number // cents
          tax_amount: number      // cents
          total_amount: number    // cents
          shipping_name: string
          shipping_line1: string
          shipping_line2: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal: string
          shipping_country: string
          shipping_phone: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          cancel_reason: string | null
          customer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod | null
          subtotal: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount: number
          shipping_name: string
          shipping_line1: string
          shipping_line2?: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal: string
          shipping_country: string
          shipping_phone?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod | null
          subtotal?: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount?: number
          shipping_name?: string
          shipping_line1?: string
          shipping_line2?: string | null
          shipping_city?: string
          shipping_state?: string
          shipping_postal?: string
          shipping_country?: string
          shipping_phone?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          product_name: string      // snapshot
          variant_name: string | null
          variant_value: string | null
          product_image: string | null // snapshot storage path
          sku: string | null
          unit_price: number        // cents, snapshot
          quantity: number
          total_price: number       // cents = unit_price * quantity
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          product_name: string
          variant_name?: string | null
          variant_value?: string | null
          product_image?: string | null
          sku?: string | null
          unit_price: number
          quantity: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          product_name?: string
          variant_name?: string | null
          variant_value?: string | null
          product_image?: string | null
          sku?: string | null
          unit_price?: number
          quantity?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
        ]
      }

      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number          // 1â€“5
          title: string | null
          body: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          body?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
    }

    // =========================================================
    // VIEWS
    // =========================================================
    Views: {
      products_with_primary_image: {
        Row: {
          // All product columns +
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          compare_at_price: number | null
          sku: string | null
          stock_quantity: number
          low_stock_threshold: number
          tags: string[]
          is_featured: boolean
          is_active: boolean
          review_count: number
          average_rating: number | null
          weight_grams: number | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
          // View-specific
          primary_image_path: string | null
          primary_image_alt: string | null
        }
        Relationships: []
      }
    }

    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }

    Enums: {
      user_role: UserRole
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
    }
  }
}

// =============================================================
// CONVENIENCE TYPE HELPERS
// =============================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// =============================================================
// DOMAIN-SPECIFIC ALIASES  (import these in features/)
// =============================================================

export type Profile          = Tables<'profiles'>
export type Address          = Tables<'addresses'>
export type Category         = Tables<'categories'>
export type Product          = Tables<'products'>
export type ProductImage     = Tables<'product_images'>
export type ProductVariant   = Tables<'product_variants'>
export type Cart             = Tables<'carts'>
export type CartItem         = Tables<'cart_items'>
export type Wishlist         = Tables<'wishlists'>
export type WishlistItem     = Tables<'wishlist_items'>
export type Order            = Tables<'orders'>
export type OrderItem        = Tables<'order_items'>
export type Review           = Tables<'reviews'>
export type ProductWithImage = Views<'products_with_primary_image'>

// Insert / Update aliases
export type InsertProfile        = TablesInsert<'profiles'>
export type InsertProduct        = TablesInsert<'products'>
export type InsertOrder          = TablesInsert<'orders'>
export type InsertOrderItem      = TablesInsert<'order_items'>
export type InsertCartItem       = TablesInsert<'cart_items'>
export type InsertReview         = TablesInsert<'reviews'>
export type UpdateProduct        = TablesUpdate<'products'>
export type UpdateOrder          = TablesUpdate<'orders'>
export type UpdateProfile        = TablesUpdate<'profiles'>

