// backend/src/routes/order.routes.ts
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth.middleware";
import { StripeService } from "../services/stripe.service";
import { processOrder } from "../services/textGenerationService";

const stripeService = new StripeService();

interface CreateOrderBody {
  texts: {
    topic: string;
    length: number;
    lengthUnit: "PAGES" | "CHARACTERS";
    language: string;
    textType: string;
    customType?: string;
    guidelines?: string;
  }[];
}

export const orderRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authenticateToken);

  // Get user's orders
  fastify.get("/", async (request, reply) => {
    const user = request.user as { userId: string };

    const orders = await prisma.order.findMany({
      where: {
        userId: user.userId,
        status: {
          in: ["IN_PROGRESS", "COMPLETED"],
        },
      },
      include: {
        texts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  });

  // Get single order
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { userId: string };

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        texts: true,
      },
    });

    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    return order;
  });

  // Create order
  fastify.post<{ Body: CreateOrderBody }>("/", async (request, reply) => {
    const user = request.user as { userId: string };
    const { texts } = request.body;

    if (!texts || texts.length === 0) {
      return reply.code(400).send({ error: "At least one text is required" });
    }

    const userWithBalance = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!userWithBalance) {
      return reply.code(404).send({ error: "User not found" });
    }

    // Generate order number
    const currentYear = new Date().getFullYear();
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `ORD-${currentYear}`,
        },
      },
      orderBy: { orderNumber: "desc" },
    });

    let orderNumber;
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.orderNumber.split("-")[2]);
      orderNumber = `ORD-${currentYear}-${String(lastNum + 1).padStart(
        4,
        "0"
      )}`;
    } else {
      orderNumber = `ORD-${currentYear}-0001`;
    }

    // Calculate prices
    let totalPrice = 0;
    const textsData = texts.map((text) => {
      const characters =
        text.lengthUnit === "PAGES" ? text.length * 2000 : text.length;
      const pages =
        text.lengthUnit === "PAGES"
          ? text.length
          : Math.ceil(text.length / 2000);
      const price = (characters / 1000) * 3.99;
      totalPrice += price;

      return {
        topic: text.topic,
        length: characters,
        lengthUnit: text.lengthUnit,
        pages,
        language: text.language,
        textType: (text.textType || "OTHER") as any,
        customType: text.customType,
        guidelines: text.guidelines,
        price,
      };
    });

    const currentBalance = parseFloat(userWithBalance.balance.toString());

    // SPRAWDŹ CZY MA WYSTARCZAJĄCE ŚRODKI
    if (currentBalance < totalPrice) {
      const missingAmount = totalPrice - currentBalance;
      const depositAmount = Math.max(missingAmount, 5);

      const order = await prisma.order.create({
        data: {
          userId: user.userId,
          orderNumber,
          totalPrice,
          status: "PENDING",
          texts: {
            create: textsData,
          },
        },
        include: {
          texts: true,
        },
      });

      const session = await stripeService.createDepositSession(
        user.userId,
        depositAmount,
        order.id
      );

      return reply.code(402).send({
        error: "Insufficient funds",
        message: `Brakuje ${missingAmount.toFixed(2)} zł. Doładuj konto.`,
        balance: currentBalance,
        required: totalPrice,
        missing: missingAmount,
        depositAmount,
        stripeUrl: session.url,
        orderId: order.id,
      });
    }

    // ✅ MA WYSTARCZAJĄCE ŚRODKI
    const newBalance = currentBalance - totalPrice;

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        orderNumber,
        totalPrice,
        status: "IN_PROGRESS",
        texts: {
          create: textsData,
        },
      },
      include: {
        texts: true,
      },
    });

    // Dodaj transakcję
    await prisma.transaction.create({
      data: {
        userId: user.userId,
        orderId: order.id,
        type: "ORDER_PAYMENT",
        amount: -totalPrice,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Płatność za zamówienie ${orderNumber}`,
      },
    });

    // Zaktualizuj saldo
    await prisma.user.update({
      where: { id: user.userId },
      data: { balance: newBalance },
    });

    // ✅✅✅ KLUCZOWE: URUCHOM PRZETWARZANIE ZAMÓWIENIA
    console.log(`\n🚀🚀🚀 URUCHAMIAM PRZETWARZANIE ZAMÓWIENIA ${order.id}`);

    // Uruchom asynchronicznie
    processOrder(order.id)
      .then(() => {
        console.log(`✅ Zamówienie ${order.id} przetworzone`);
      })
      .catch((error) => {
        console.error(`❌ Błąd przetwarzania zamówienia ${order.id}:`, error);
      });

    return reply.code(201).send(order);
  });

  // Delete order (only if PENDING)
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { userId: string };

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return reply
        .code(400)
        .send({ error: "Cannot delete order that is not pending" });
    }

    await prisma.order.delete({ where: { id } });

    return { message: "Order deleted successfully" };
  });

  // Deposit endpoint
  fastify.post("/deposit", async (request, reply) => {
    const user = request.user as { userId: string };
    const { amount } = request.body as { amount: number };

    if (!amount || amount < 5) {
      return reply.code(400).send({ error: "Minimalna kwota to 5 PLN" });
    }

    const session = await stripeService.createDepositSession(
      user.userId,
      amount
    );

    return reply.send({
      stripeUrl: session.url,
    });
  });
};
