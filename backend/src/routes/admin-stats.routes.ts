// backend/src/routes/admin-stats.routes.ts
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

export async function adminStatsRoutes(fastify: FastifyInstance) {
  // Middleware
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireAdmin);

  // Dashboard stats
  fastify.get("/", async (request, reply) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalUsers,
        verifiedUsers,
        totalOrders,
        pendingOrders,
        completedOrders,
        failedOrders,
        totalBlogPosts,
        publishedBlogPosts,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),

        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
        prisma.blogPost.count({ where: { status: "DRAFT" } }),
      ]);

      // Calculate revenue
      const allOrders = await prisma.order.findMany({
        where: { status: "COMPLETED" },
        select: { totalPrice: true, createdAt: true },
      });

      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + Number(order.totalPrice),
        0
      );
      const monthRevenue = allOrders
        .filter((order) => order.createdAt >= startOfMonth)
        .reduce((sum, order) => sum + Number(order.totalPrice), 0);

      return reply.code(200).send({
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          unverified: totalUsers - verifiedUsers,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          failed: failedOrders,
        },
        blog: {
          total: totalBlogPosts,
          published: publishedBlogPosts,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: monthRevenue,
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Błąd podczas pobierania statystyk",
      });
    }
  });
}
