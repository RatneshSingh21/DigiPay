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
        localStorage.removeItem("auth-storage");
      },

      setAuthReady: () => set({ isAuthReady: true }),

      setCompanyId: (companyId) => set({ companyId }),

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
          companyId: data.companyId ?? state.companyId,
        })),

      // New function to update only the token & companyId
      updateToken: (newToken) => {
        let companyId = null;
        try {
          const decoded = jwtDecode(newToken);
          const rawCompanyId = decoded.companyId || decoded.CompanyId || null;
          companyId = rawCompanyId ? Number(rawCompanyId) : null;
        } catch (error) {
          console.error("Failed to decode new JWT:", error);
        }

        set((state) => ({
          token: newToken,
          companyId: companyId ?? state.companyId, // fallback to old if not found
        }));
      },
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
