import { create } from 'zustand';
import { Project, Transaction, AppNotification } from '../constants/types';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

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

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

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
}));
