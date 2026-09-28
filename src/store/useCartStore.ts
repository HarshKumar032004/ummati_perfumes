import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string          // Unique identifier for the cart item (usually variantId or productId)
  productId: string
  name: string
  slug: string
  price: number       // in paise
  quantity: number
  image: string
  variantLabel?: string // Optional variant (e.g. 50ml, 100ml)
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  giftWrap: boolean
  giftNote: string
  setGiftWrap: (enabled: boolean) => void
  setGiftNote: (note: string) => void
  
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  
  // UI State
  setIsOpen: (isOpen: boolean) => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      giftWrap: false,
      giftNote: '',
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      setGiftNote: (giftNote) => set({ giftNote }),

      addItem: (newItem: CartItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id)
        
        if (existingItem) {
          // Increase quantity if item already exists
          return {
            items: state.items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
            isOpen: true // Automatically open cart when adding
          }
        }
        
        // Add new item
        return { 
          items: [...state.items, newItem],
          isOpen: true
        }
      }),

      removeItem: (id: string) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      updateQuantity: (id: string, quantity: number) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),

      clearCart: () => set({ items: [] }),
      
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false })
    }),
    {
      name: 'ummati-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Do not persist UI state 'isOpen'
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// Selectors
export const useCartCount = () => useCartStore((state) => 
  state.items.reduce((total, item) => total + item.quantity, 0)
)

export const useCartSubtotal = () => useCartStore((state) => 
  state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
)
