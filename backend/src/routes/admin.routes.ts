// backend/src/routes/admin.routes.ts

import { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/admin.middleware";
import { prisma } from "../lib/prisma";

export const adminRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", async (request, reply) => {
    await request.jwtVerify();
  });
  fastify.addHook("preHandler", requireAdmin);

  // ============= USERS =============

  // Get all users with balance and orders count
  fastify.get("/users", async (request, reply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        balance: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  });

  // Get detailed text info with prompts
  fastify.get("/texts/:id/details", async (request, reply) => {
    const { id } = request.params as { id: string };

    const text = await prisma.text.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!text) {
      return reply.code(404).send({ error: "Text not found" });
    }

    return text;
  });

  // Update text content (admin edit)
  fastify.patch("/texts/:id/content", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { htmlContent } = request.body as { htmlContent: string };

    const text = await prisma.text.findUnique({ where: { id } });
    if (!text) {
      return reply.code(404).send({ error: "Text not found" });
    }

    const existingData = JSON.parse(text.content || "{}");
    existingData.generatedContent = htmlContent;
    existingData.lastEditedAt = new Date().toISOString();
    existingData.editedBy = "admin";

    await prisma.text.update({
      where: { id },
      data: {
        content: JSON.stringify(existingData, null, 2),
      },
    });

    return { success: true };
  });

  // Get single user with orders
  fastify.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        balance: true,
        isVerified: true,
        createdAt: true,
        orders: {
          include: {
            texts: true,
          },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return user;
  });

  // Update user balance
  fastify.patch("/users/:id/balance", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { amount, reason } = request.body as {
      amount: number;
      reason: string;
    };

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    const balanceBefore = parseFloat(user.balance.toString());
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId: id,
        type: amount > 0 ? "DEPOSIT" : "REFUND",
        amount: Math.abs(amount),
        balanceBefore,
        balanceAfter,
        description: `Admin: ${reason}`,
      },
    });

    // Update balance
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { balance: balanceAfter },
    });

    return { message: "Balance updated", user: updatedUser };
  });

  // Update user role
  fastify.patch("/users/:id/role", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { role } = request.body as { role: "USER" | "ADMIN" };

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return { message: "Role updated", user };
  });

  // Delete user
  fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.user.delete({ where: { id } });
    return { message: "User deleted" };
  });

  // ============= ORDERS =============

  // Get all orders
  fastify.get("/orders", async (request, reply) => {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        texts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  });

  // Get single order
  fastify.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        texts: true,
        transactions: true,
      },
    });

    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    return order;
  });

  // Update order status
  fastify.patch("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status, notes } = request.body as {
      status?: string;
      notes?: string;
    };

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status: status as any }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
        texts: true,
      },
    });

    return { message: "Order updated", order };
  });

  // Delete order
  fastify.delete("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    // Get order with user
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    // If order was paid, refund
    if (order.status !== "PENDING") {
      const refundAmount = parseFloat(order.totalPrice.toString());
      const currentBalance = parseFloat(order.user.balance.toString());
      const newBalance = currentBalance + refundAmount;

      await prisma.transaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: "REFUND",
          amount: refundAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: `Zwrot za usunięte zamówienie ${order.orderNumber}`,
        },
      });

      await prisma.user.update({
        where: { id: order.userId },
        data: { balance: newBalance },
      });
    }

    // Delete order (cascade deletes texts)
    await prisma.order.delete({ where: { id } });

    return { message: "Order deleted" };
  });
};
