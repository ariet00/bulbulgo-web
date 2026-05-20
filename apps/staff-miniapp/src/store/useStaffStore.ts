import { create } from 'zustand'
import type { StaffMe } from '@/types/staff'

export type BootStatus = 'idle' | 'pending' | 'ready' | 'no-telegram' | 'error'

type StaffState = {
  bootStatus: BootStatus
  errorMessage: string | null
  me: StaffMe | null
  setBootStatus: (s: BootStatus) => void
  setError: (msg: string | null) => void
  setMe: (me: StaffMe | null) => void
}

export const useStaffStore = create<StaffState>((set) => ({
  bootStatus: 'idle',
  errorMessage: null,
  me: null,
  setBootStatus: (bootStatus) => set({ bootStatus }),
  setError: (errorMessage) => set({ errorMessage, bootStatus: 'error' }),
  setMe: (me) => set({ me }),
}))
