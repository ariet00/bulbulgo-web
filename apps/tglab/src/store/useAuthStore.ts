import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { TglabSession, TglabUser } from '@/types'

interface AuthState {
  user: TglabUser | null
  token: string | null
  refreshToken: string | null
  /** localStorage has been read back — until then "no token" means "unknown",
   *  not "logged out", so the guard must wait instead of redirecting. */
  hydrated: boolean
  setSession: (session: TglabSession) => void
  setUser: (user: TglabUser) => void
  setToken: (token: string) => void
  setHydrated: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      hydrated: false,
      setSession: (session) =>
        set({
          user: session.user,
          token: session.access_token,
          refreshToken: session.refresh_token,
        }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHydrated: (value) => set({ hydrated: value }),
      clear: () => set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: 'tglab-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

/** True if the signed-in role grants `permission` (backend still enforces). */
export function useHasPermission(permission: string): boolean {
  return useAuthStore((s) => Boolean(s.user?.permissions.includes(permission)))
}
