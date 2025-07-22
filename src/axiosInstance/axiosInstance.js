// utils/axiosInstance.js
import axios from "axios";
import useAuthStore from "../store/authStore"; // adjust path as needed

const axiosInstance = axios.create({
  baseURL: "https://digipaydevops.digicodesoftware.com/api", // your actual API base
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token from Zustand store instead of localStorage
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

export default axiosInstance;
