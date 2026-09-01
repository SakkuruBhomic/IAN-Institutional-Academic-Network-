import { create } from 'zustand'

interface AppStoreState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const getPreferredTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  const storedTheme = window.localStorage.getItem('ian-theme-v1')
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  return 'dark'
}

export const useAppStore = create<AppStoreState>((set) => ({
  theme: getPreferredTheme(),
  sidebarOpen: true,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ian-theme-v1', theme)
      document.documentElement.dataset.theme = theme
    }
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ian-theme-v1', nextTheme)
        document.documentElement.dataset.theme = nextTheme
      }
      return { theme: nextTheme }
    }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

