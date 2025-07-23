import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthReady: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null }),

      setAuthReady: () => set({ isAuthReady: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state, error) => {
        return (set) => {
          set({ isAuthReady: true });
        };
      },
    }
  )
);

export default useAuthStore;
