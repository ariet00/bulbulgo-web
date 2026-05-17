'use client'

import { create } from 'zustand'

import type { AkchaMe } from '@/types/akcha'

export type BootStatus = 'idle' | 'pending' | 'no-telegram' | 'ready' | 'error'

interface AkchaState {
  bootStatus: BootStatus
  errorMessage: string | null
  me: AkchaMe | null
  setBootStatus: (s: BootStatus) => void
  setError: (msg: string | null) => void
  setMe: (m: AkchaMe | null) => void
}

export const useAkchaStore = create<AkchaState>(set => ({
  bootStatus: 'idle',
  errorMessage: null,
  me: null,
  setBootStatus: bootStatus => set({ bootStatus }),
  setError: errorMessage => set({ errorMessage, bootStatus: errorMessage ? 'error' : 'ready' }),
  setMe: me => set({ me }),
}))
