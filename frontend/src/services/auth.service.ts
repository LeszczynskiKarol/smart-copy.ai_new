// frontend/services/auth.service.ts

import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/config";
import {
  AuthResponse,
  RegisterData,
  LoginData,
  VerifyCodeData,
  ResendCodeData,
  ForgotPasswordData,
  ResetPasswordData,
  User,
} from "@/types";

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      data
    );
    return response.data;
  },

  verify: async (data: VerifyCodeData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.verify,
      data
    );
    return response.data;
  },

  resendCode: async (data: ResendCodeData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.resendCode,
      data
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.forgotPassword,
      data
    );
    return response.data;
  },

  googleLogin: async (googleToken: string) => {
    const response = await apiClient.post(`/auth/google`, {
      googleToken,
    });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.resetPassword,
      data
    );
    return response.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.auth.me);
    return response.data;
  },
};
