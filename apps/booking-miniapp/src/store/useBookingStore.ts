'use client'

import { create } from 'zustand'

import type { Business } from '@/types/booking'

type BookingStoreState = {
  bootStatus: 'idle' | 'pending' | 'ready' | 'no-telegram' | 'error'
  errorMessage: string | null
  business: Business | null
  isOwner: boolean
  setBootStatus: (s: BookingStoreState['bootStatus']) => void
  setError: (msg: string | null) => void
  setBusiness: (b: Business | null) => void
}

export const useBookingStore = create<BookingStoreState>((set) => ({
  bootStatus: 'idle',
  errorMessage: null,
  business: null,
  isOwner: false,
  setBootStatus: (s) => set({ bootStatus: s }),
  setError: (msg) => set({ errorMessage: msg }),
  setBusiness: (b) => set({ business: b, isOwner: b?.is_owner ?? false }),
}))
