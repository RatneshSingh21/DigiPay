import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const themeStore = (set) => ({
  mode: 'light',
  palette: 'orange',

  toggleMode: () =>
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light'
      return { mode: newMode }
    }),

  setPalette: (palette) => set({ palette }),
})

const useThemeStore = create(
  devtools(
    persist(themeStore, {
      name: 'theme-storage',
    })
  )
)

export default useThemeStore
