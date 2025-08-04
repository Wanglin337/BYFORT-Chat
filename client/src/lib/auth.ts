import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  balance: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateBalance: (balance) => set((state) => ({
        user: state.user ? { ...state.user, balance } : null
      })),
    }),
    {
      name: 'byfort-auth',
    }
  )
);
