import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// Types
// ============================================================

type WishlistItem = {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  image: string | null
  addedAt: string // ISO date string
}

type WishlistStore = {
  items: WishlistItem[]
  // Actions
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

// ============================================================
// Store
// ============================================================

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        if (get().isInWishlist(newItem.productId)) return
        set((state) => ({
          items: [...state.items, { ...newItem, addedAt: new Date().toISOString() }],
        }))
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'bagify-wishlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
