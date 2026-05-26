import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// Types
// ============================================================

export type CartItem = {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string | null
  variant?: {
    id: string
    name: string
    value: string
  }
}

type CartStore = {
  items: CartItem[]
  // Derived
  totalItems: number
  totalPrice: number
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// ============================================================
// Store
// ============================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      get totalPrice() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === newItem.id)

          if (existingIndex !== -1) {
            const updatedItems = [...state.items]
            const existing = updatedItems[existingIndex]
            if (existing) {
              updatedItems[existingIndex] = {
                ...existing,
                quantity: existing.quantity + (newItem.quantity ?? 1),
              }
            }
            return { items: updatedItems }
          }

          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity ?? 1 }],
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
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'bagify-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
