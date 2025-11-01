import axios from "axios";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

// Create base Axios instance
//baseURL: "https://marigoldapi.digicodesoftware.com/api",
//baseURL: "https://digipaydevops.digicodesoftware.com/api",
//baseURL: "https://digipaystaggingapi.digicodesoftware.com/api",
//baseURL: "https://starpayapi.digicodesoftware.com/api",

const axiosInstance = axios.create({
  baseURL: "https://digipaydevops.digicodesoftware.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useAuthStore.getState().refreshToken
    ) {
      originalRequest._retry = true;

      const { refreshToken, user, login, logout } = useAuthStore((state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        login: state.login,
        logout: state.logout,
      }));

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axiosInstance.post(`/user-auth/refresh-token`, {
          refreshToken,
        });

        const {
          token: newToken,
          refreshToken: newRefreshToken,
          user: updatedUser,
        } = res.data;

        // Update Zustand store with new token + refresh token
        login(updatedUser ?? user, newToken, newRefreshToken);

        // Update token in header
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // Retry the failed request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logout();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/auth"; // or "/login" as per your route
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
