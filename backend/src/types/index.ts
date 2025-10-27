// backend/src/types/index.ts
import { FastifyRequest } from "fastify";

// Rozszerzamy Fastify types poprzez module augmentation
declare module "fastify" {
  interface FastifyRequest {
    authUser?: {
      userId: string;
      email: string;
    };
  }
}

export interface AuthenticatedRequest extends FastifyRequest {}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
  recaptchaToken: string;
}

export interface VerifyCodeInput {
  email: string;
  code: string;
}

export interface LoginInput {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface ResendCodeInput {
  email: string;
  recaptchaToken: string;
}

export interface ForgotPasswordInput {
  email: string;
  recaptchaToken: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}
