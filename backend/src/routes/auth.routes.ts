// backend/src/routes/auth.routes.ts

import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { verifyGoogleToken } from "../services/google-auth.service";
import { authenticateToken } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/helpers";
import {
  RegisterInput,
  VerifyCodeInput,
  LoginInput,
  ResendCodeInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../types";

const authService = new AuthService();

export const authRoutes = async (fastify: FastifyInstance) => {
  // POST /api/auth/register
  fastify.post<{ Body: RegisterInput }>("/register", async (request, reply) => {
    try {
      const result = await authService.register(request.body);
      return reply.code(201).send(result);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          error: error.message,
          code: error.code,
        });
      }
      console.error("Register error:", error);
      return reply.code(500).send({ error: "Wystąpił błąd serwera" });
    }
  });

  // POST /api/auth/verify
  fastify.post<{ Body: VerifyCodeInput }>("/verify", async (request, reply) => {
    try {
      const result = await authService.verifyEmail(request.body);
      return reply.code(200).send(result);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          error: error.message,
        });
      }
      console.error("Verify error:", error);
      return reply.code(500).send({ error: "Wystąpił błąd serwera" });
    }
  });

  // POST /api/auth/login
  fastify.post<{ Body: LoginInput }>("/login", async (request, reply) => {
    try {
      const result = await authService.login(request.body);
      return reply.code(200).send(result);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          error: error.message,
        });
      }
      console.error("Login error:", error);
      return reply.code(500).send({ error: "Wystąpił błąd serwera" });
    }
  });

  fastify.post<{ Body: { googleToken: string } }>(
    "/google",
    async (request, reply) => {
      try {
        const { googleToken } = request.body;
        const result = await authService.googleLogin(googleToken);
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
          });
        }
        console.error("Google login error:", error);
        return reply.code(500).send({ error: "Wystąpił błąd serwera" });
      }
    }
  );

  // POST /api/auth/resend-code
  fastify.post<{ Body: ResendCodeInput }>(
    "/resend-code",
    async (request, reply) => {
      try {
        const { email, recaptchaToken } = request.body;
        const result = await authService.resendVerificationCode(
          email,
          recaptchaToken
        );
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
          });
        }
        console.error("Resend code error:", error);
        return reply.code(500).send({ error: "Wystąpił błąd serwera" });
      }
    }
  );

  // POST /api/auth/forgot-password
  fastify.post<{ Body: ForgotPasswordInput }>(
    "/forgot-password",
    async (request, reply) => {
      try {
        const result = await authService.forgotPassword(request.body);
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
          });
        }
        console.error("Forgot password error:", error);
        return reply.code(500).send({ error: "Wystąpił błąd serwera" });
      }
    }
  );

  // POST /api/auth/reset-password
  fastify.post<{ Body: ResetPasswordInput }>(
    "/reset-password",
    async (request, reply) => {
      try {
        const result = await authService.resetPassword(request.body);
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
          });
        }
        console.error("Reset password error:", error);
        return reply.code(500).send({ error: "Wystąpił błąd serwera" });
      }
    }
  );

  // POST /api/auth/refresh
  fastify.post<{ Body: { refreshToken: string } }>(
    "/refresh",
    async (request, reply) => {
      try {
        const { refreshToken } = request.body;

        if (!refreshToken) {
          return reply.code(400).send({ error: "Refresh token wymagany" });
        }

        const result = await authService.refreshTokens(refreshToken);
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
          });
        }
        console.error("Refresh token error:", error);
        return reply.code(401).send({ error: "Nie udało się odświeżyć sesji" });
      }
    }
  );

  // Get current user
  fastify.get(
    "/me",
    {
      onRequest: [authenticateToken],
    },
    async (request, reply) => {
      const user = request.user as { userId: string };

      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          balance: true,
        },
      });

      if (!userData) {
        return reply.code(404).send({ error: "User not found" });
      }

      return userData;
    }
  );
};
