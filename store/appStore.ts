import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, Transaction, AppNotification } from '../constants/types';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Security
  appLockEnabled: boolean;
  toggleAppLock: () => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;

  // Notifications
  notifications: AppNotification[];
  setNotifications: (n: AppNotification[]) => void;
  unreadCount: number;
  setUnreadCount: (n: number) => void;

  // Selected project filter
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

      appLockEnabled: false,
      toggleAppLock: () => set((s) => ({ appLockEnabled: !s.appLockEnabled })),

      projects: [],
      setProjects: (projects) => set({ projects }),

      transactions: [],
      setTransactions: (transactions) => set({ transactions }),

      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      unreadCount: 0,
      setUnreadCount: (unreadCount) => set({ unreadCount }),

      selectedProjectId: null,
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
    }),
    {
      name: 'vinyak-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode,
        appLockEnabled: state.appLockEnabled
      }),
    }
  )
);
