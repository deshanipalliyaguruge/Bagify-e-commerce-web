import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type CartVariant = {
  id: string
  name: string   // e.g. "Color"
  value: string  // e.g. "Black"
}

export type CartItem = {
  /** Unique key: productId + variantId (or just productId if no variant) */
  id: string
  productId: string
  variantId: string | null
  name: string
  slug: string
  /** Price in cents — matches DB schema */
  price: number
  quantity: number
  image: string | null
  variant: CartVariant | null
  /** Max purchasable quantity (from stock_quantity) */
  maxQuantity?: number
}

export type Coupon = {
  code: string
  /** Discount in cents */
  discountAmount: number
  /** Discount as a fraction 0–1 (e.g. 0.10 for 10%). Null for fixed-amount. */
  discountPercent: number | null
  description: string
}

export type CartStore = {
  // ── State ────────────────────────────────────────────────────
  items: CartItem[]
  coupon: Coupon | null
  /** Whether a DB sync operation is in flight */
  isSyncing: boolean
  /** DB cart row ID for the authenticated user's server cart */
  dbCartId: string | null

  // ── Derived (computed on read) ───────────────────────────────
  totalItems: number
  subtotal: number
  discountAmount: number
  total: number

  // ── Item actions ─────────────────────────────────────────────
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  // ── Coupon actions ───────────────────────────────────────────
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void

  // ── Sync helpers ─────────────────────────────────────────────
  setDbCartId: (id: string | null) => void
  setSyncing: (syncing: boolean) => void
}

// ─────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isSyncing: false,
      dbCartId: null,

      // ── Derived ─────────────────────────────────────────────

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      get discountAmount() {
        const { coupon, subtotal } = get()
        if (!coupon) return 0
        if (coupon.discountPercent !== null) {
          return Math.round(subtotal * coupon.discountPercent)
        }
        return Math.min(coupon.discountAmount, subtotal)
      },

      get total() {
        return Math.max(0, get().subtotal - get().discountAmount)
      },

      // ── Item actions ─────────────────────────────────────────

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === newItem.id)

          if (existingIndex !== -1) {
            const updatedItems = [...state.items]
            const existing = updatedItems[existingIndex]
            if (!existing) return state

            const addQty = newItem.quantity ?? 1
            const newQty = existing.quantity + addQty
            const clampedQty =
              existing.maxQuantity !== undefined
                ? Math.min(newQty, existing.maxQuantity)
                : newQty

            updatedItems[existingIndex] = { ...existing, quantity: clampedQty }
            return { items: updatedItems }
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: newItem.quantity ?? 1,
                variant: newItem.variant ?? null,
                variantId: newItem.variantId ?? null,
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const clamped =
              item.maxQuantity !== undefined ? Math.min(quantity, item.maxQuantity) : quantity
            return { ...item, quantity: clamped }
          }),
        }))
      },

      clearCart: () => set({ items: [], coupon: null, dbCartId: null }),

      // ── Coupon ───────────────────────────────────────────────

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      // ── Sync helpers ─────────────────────────────────────────

      setDbCartId: (id) => set({ dbCartId: id }),
      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: 'bagify-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist the items, coupon, and dbCartId — not transient sync state
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        dbCartId: state.dbCartId,
      }),
    },
  ),
)
