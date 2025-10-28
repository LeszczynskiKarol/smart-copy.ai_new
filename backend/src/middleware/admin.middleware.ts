// backend/src/middleware/admin.middleware.ts:

import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Sprawdź czy jwtVerify zostało wywołane
  if (!request.user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const payload = request.user as { userId: string; email: string };

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return reply.status(403).send({ error: "Admin access required" });
  }
};
