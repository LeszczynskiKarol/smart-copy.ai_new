// frontend/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  email?: string;
  userId?: string;
  resent?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
  recaptchaToken: string;
}

export interface LoginData {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface ResendCodeData {
  email: string;
  recaptchaToken: string;
}

export interface ForgotPasswordData {
  email: string;
  recaptchaToken: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
