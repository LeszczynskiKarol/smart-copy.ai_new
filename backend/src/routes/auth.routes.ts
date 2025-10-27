// backend/src/routes/auth.routes.ts

import { FastifyInstance } from "fastify";
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

  // GET /api/auth/me - test endpoint dla sprawdzenia czy użytkownik jest zalogowany
  fastify.get("/me", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Brak autoryzacji" });
      }

      const token = authHeader.substring(7);
      const { verifyAccessToken } = await import("../utils/jwt");
      const decoded = verifyAccessToken(token);

      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: "Użytkownik nie znaleziony" });
      }

      return reply.code(200).send({ user });
    } catch (error) {
      console.error("Me endpoint error:", error);
      return reply.code(401).send({ error: "Nieprawidłowy token" });
    }
  });
};
