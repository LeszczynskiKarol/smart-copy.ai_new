// frontend/src/lib/api.ts

import axios, { AxiosError } from "axios";
import { config } from "@/config";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - dodawanie tokenu
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("smart-copy-auth");
    if (authData) {
      const { state } = JSON.parse(authData);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - obsługa błędów
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token wygasł - wylogowanie
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return "Wystąpił błąd. Spróbuj ponownie.";
};
