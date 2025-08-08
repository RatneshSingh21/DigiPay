import { create } from "zustand";
import { persist } from "zustand/middleware";

const useEmployeeAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
        }),
    }),
    {
      name: "employee-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useEmployeeAuthStore;