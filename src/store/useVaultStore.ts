'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface VaultState {
  productIds: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
}

export const useVaultStore = create<VaultState>()(persist((set, get) => ({
  productIds: [],
  toggle: (productId) => set((state) => ({
    productIds: state.productIds.includes(productId)
      ? state.productIds.filter((id) => id !== productId)
      : [...state.productIds, productId],
  })),
  has: (productId) => get().productIds.includes(productId),
}), { name: 'ummati-vault', storage: createJSONStorage(() => localStorage) }))

export const useVaultCount = () => useVaultStore((state) => state.productIds.length)
