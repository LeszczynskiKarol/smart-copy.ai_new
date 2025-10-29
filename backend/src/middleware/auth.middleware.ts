// backend/src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { AppError, errorMessages } from "../utils/helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticateToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, errorMessages.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Dodanie użytkownika do request
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Nieprawidłowy token");
  }
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
    const payload = request.user as { userId: string; email: string };
    request.authUser = {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
};

// ✅ DODANA FUNKCJA requireAdmin
export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Pobierz userId z zweryfikowanego tokena
    const payload = request.user as { userId: string; email: string };

    if (!payload?.userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Sprawdź rolę użytkownika w bazie danych
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return reply.status(403).send({
        error: "Forbidden - Admin access required",
      });
    }

    // Użytkownik jest adminem - kontynuuj
  } catch (error) {
    return reply.status(500).send({
      error: "Internal server error",
    });
  }
};
