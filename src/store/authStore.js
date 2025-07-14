// store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: "auth-storage", // stored as auth-storage in localStorage
    }
  )
);

export default useAuthStore;
