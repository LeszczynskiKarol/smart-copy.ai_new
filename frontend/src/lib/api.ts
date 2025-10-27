// frontend/src/lib/api.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string };
    return data?.error || "Wystąpił błąd podczas komunikacji z serwerem";
  }
  return "Wystąpił nieoczekiwany błąd";
};
