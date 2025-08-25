import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      companyId: null,
      isAuthReady: false,

      login: (user, token, refreshToken) => {
        let companyId = null;

        try {
          const decoded = jwtDecode(token);
          // handle both possible casings and force it into a number
          const rawCompanyId = decoded.companyId || decoded.CompanyId || null;
          companyId = rawCompanyId ? Number(rawCompanyId) : null;
        } catch (error) {
          console.error("Failed to decode JWT:", error);
        }

        set({
          user,
          token,
          refreshToken,
          companyId,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          companyId: null,
        });
        localStorage.removeItem("auth-storage"); // clear persisted store
      },

      setAuthReady: () => set({ isAuthReady: true }),

      setCompanyId: (companyId) => set({ companyId }),

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
          companyId: data.companyId ?? state.companyId,
        })),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => {
        return (state) => {
          if (state) state.isAuthReady = true;
        };
      },
    }
  )
);

export default useAuthStore;
