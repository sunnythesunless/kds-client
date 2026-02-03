import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    _hasHydrated: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            _hasHydrated: false,
            setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
            updateUser: (user) => set({ user }),
            logout: () => set({ user: null, token: null, refreshToken: null }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
