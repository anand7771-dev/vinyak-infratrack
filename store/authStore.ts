import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from '../constants/types';

interface AuthState {
  user: AppUser | null;
  firebaseUser: { uid: string; email: string | null } | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: AppUser | null) => void;
  setFirebaseUser: (u: { uid: string; email: string | null } | null) => void;
  setLoading: (b: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUser: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () =>
        set({ user: null, firebaseUser: null, isAuthenticated: false }),
    }),
    {
      name: 'vinyak-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
