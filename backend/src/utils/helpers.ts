// backend/src/utils/helper.ts
import crypto from "crypto";

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPasswordStrong = (password: string): boolean => {
  // Minimum 8 znaków, przynajmniej 1 wielka litera, 1 mała litera, 1 cyfra
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorMessages = {
  INVALID_EMAIL: "Nieprawidłowy adres email",
  WEAK_PASSWORD:
    "Hasło musi mieć minimum 8 znaków, zawierać dużą i małą literę oraz cyfrę",
  EMAIL_EXISTS: "Użytkownik z tym adresem email już istnieje",
  USER_NOT_FOUND: "Użytkownik nie został znaleziony",
  INVALID_CREDENTIALS: "Nieprawidłowy email lub hasło",
  EMAIL_NOT_VERIFIED: "Email nie został zweryfikowany",
  INVALID_CODE: "Nieprawidłowy lub wygasły kod weryfikacyjny",
  CODE_EXPIRED: "Kod weryfikacyjny wygasł",
  TERMS_NOT_ACCEPTED: "Musisz zaakceptować regulamin i politykę prywatności",
  RECAPTCHA_FAILED: "Weryfikacja reCAPTCHA nie powiodła się",
  RATE_LIMIT_EXCEEDED: "Zbyt wiele prób. Spróbuj ponownie później",
  INVALID_TOKEN: "Nieprawidłowy lub wygasły token",
  UNAUTHORIZED: "Brak autoryzacji",
};
