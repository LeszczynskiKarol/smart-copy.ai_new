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

// Flaga zapobiegająca wielokrotnemu odświeżaniu
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

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

// Response interceptor - automatyczne odświeżanie tokenu
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Jeśli 401 i nie próbowaliśmy jeszcze odświeżyć
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nie próbuj odświeżać dla endpointu refresh (unikamy pętli)
      if (originalRequest.url?.includes("/auth/refresh")) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Jeśli już odświeżamy, dodaj request do kolejki
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authData = localStorage.getItem("smart-copy-auth");
      if (!authData) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      const { state } = JSON.parse(authData);
      const refreshToken = state?.refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // Użyj czystego axios (nie apiClient) żeby uniknąć interceptorów
        const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Zaktualizuj store z nowymi tokenami
        const currentUser = state.user;
        useAuthStore
          .getState()
          .setAuth(currentUser, accessToken, newRefreshToken);

        // Przetwórz kolejkę oczekujących requestów
        processQueue(null, accessToken);

        // Powtórz oryginalny request z nowym tokenem
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
