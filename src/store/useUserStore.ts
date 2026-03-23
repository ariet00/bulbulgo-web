import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface UserState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setUser: (user: User) => void;
    setToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
    clearUser: () => void;
    setHasHydrated: (state: boolean) => void;
    isGuest: () => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setUser: (user) => set({ user, isAuthenticated: true }),
            setToken: (token) => set({ token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            clearUser: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            isGuest: () => {
                const state = get();
                return state._hasHydrated && !state.isAuthenticated;
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
