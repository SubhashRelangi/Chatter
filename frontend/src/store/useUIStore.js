import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
