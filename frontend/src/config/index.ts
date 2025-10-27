// frontend/src/config/index.ts

export const config = {
  apiUrl:
    import.meta.env.VITE_API_URL || "https://server-reactapp.ngrok.app/api",
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
} as const;

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    verify: "/auth/verify",
    resendCode: "/auth/resend-code",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    me: "/auth/me",
  },
} as const;
