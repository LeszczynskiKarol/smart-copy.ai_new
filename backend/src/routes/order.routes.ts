// backend/src/routes/order.routes.ts
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth.middleware";
import { StripeService } from "../services/stripe.service";
import { S3Service } from "../services/s3.service";
import { processOrder } from "../services/textGenerationService";
import { sendOrderNotificationToSlack } from "../services/slackNotificationService";

const stripeService = new StripeService();
const s3Service = new S3Service();

interface CreateOrderBody {
  texts: {
    topic: string;
    length: number;
    lengthUnit: "PAGES" | "CHARACTERS";
    language: string;
    textType: string;
    customType?: string;
    guidelines?: string;
    userSources?: {
      urls: string[];
      files: any[];
    };
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

    // ✅ TRANSFORMUJ: wyciągnij generatedContent z content JSON
    const transformedOrders = orders.map((order) => ({
      ...order,
      texts: order.texts.map((text) => {
        let generatedContent = null;
        if (text.content) {
          try {
            const contentData = JSON.parse(text.content);
            generatedContent = contentData.generatedContent || null;
          } catch (error) {
            console.error(`Failed to parse content for text ${text.id}`);
          }
        }
        return {
          ...text,
          generatedContent,
          // Nie wysyłaj całego content (za duży)
          content: undefined,
        };
      }),
    }));

    return transformedOrders;
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

    // ✅ TRANSFORMUJ: wyciągnij generatedContent
    const transformedOrder = {
      ...order,
      texts: order.texts.map((text) => {
        let generatedContent = null;
        if (text.content) {
          try {
            const contentData = JSON.parse(text.content);
            generatedContent = contentData.generatedContent || null;
          } catch (error) {
            console.error(`Failed to parse content for text ${text.id}`);
          }
        }
        return {
          ...text,
          generatedContent,
          content: undefined,
        };
      }),
    };

    return transformedOrder;
  });

  // Create order - ZAKTUALIZOWANE z obsługą plików
  fastify.post("/", async (request, reply) => {
    const user = request.user as { userId: string };

    let textsData: any[] = [];
    let filesByTextIndex: Map<number, any[]> = new Map();

    // Sprawdź Content-Type
    const contentType = request.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
      // Przetwarzanie multipart z pluginem
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "field" && part.fieldname === "textsData") {
          textsData = JSON.parse(part.value as string);
        } else if (part.type === "file") {
          // Format: text_0_files, text_1_files, etc.
          const match = part.fieldname.match(/text_(\d+)_files/);
          if (match) {
            const textIndex = parseInt(match[1]);
            const buffer = await part.toBuffer();

            if (!filesByTextIndex.has(textIndex)) {
              filesByTextIndex.set(textIndex, []);
            }

            filesByTextIndex.get(textIndex)!.push({
              filename: part.filename,
              mimetype: part.mimetype,
              buffer,
            });
          }
        }
      }
    } else {
      // Standardowy JSON
      const body = request.body as CreateOrderBody;
      textsData = body.texts;
    }

    if (!textsData || textsData.length === 0) {
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

    // Calculate prices i przygotuj dane tekstów
    let totalPrice = 0;
    const preparedTexts = await Promise.all(
      textsData.map(async (text, index) => {
        const characters =
          text.lengthUnit === "PAGES" ? text.length * 2000 : text.length;
        const pages =
          text.lengthUnit === "PAGES"
            ? text.length
            : Math.ceil(text.length / 2000);
        const price = (characters / 1000) * 3.99;
        totalPrice += price;

        // Przygotuj userSources
        let userSourcesJson = null;

        if (text.userSources || filesByTextIndex.has(index)) {
          const urls = text.userSources?.urls || [];
          const uploadedFiles = [];

          // Upload plików do S3
          const filesForThisText = filesByTextIndex.get(index) || [];
          for (const file of filesForThisText) {
            try {
              const { s3Key, url } = await s3Service.uploadFile(
                file.buffer,
                file.filename,
                file.mimetype
              );

              uploadedFiles.push({
                name: file.filename,
                s3Key,
                url,
              });

              console.log(`✅ Uploaded file to S3: ${file.filename}`);
            } catch (error) {
              console.error(`❌ Failed to upload ${file.filename}:`, error);
            }
          }

          if (urls.length > 0 || uploadedFiles.length > 0) {
            userSourcesJson = JSON.stringify({
              urls,
              files: uploadedFiles,
            });
          }
        }

        // ✅ PRZYGOTUJ DANE SEO
        let seoKeywordsJson = null;
        let seoLinksJson = null;

        if (text.seoData) {
          if (text.seoData.keywords && text.seoData.keywords.length > 0) {
            seoKeywordsJson = JSON.stringify(text.seoData.keywords);
          }
          if (text.seoData.links && text.seoData.links.length > 0) {
            seoLinksJson = JSON.stringify(text.seoData.links);
          }
        }

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
          userSources: userSourcesJson,
          seoKeywords: seoKeywordsJson,
          seoLinks: seoLinksJson,
        };
      })
    );

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
            create: preparedTexts,
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
          create: preparedTexts,
        },
      },
      include: {
        texts: true,
        user: {
          select: {
            email: true,
          },
        },
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

    try {
      await sendOrderNotificationToSlack({
        orderNumber: order.orderNumber,
        orderId: order.id,
        userEmail: order.user.email,
        totalPrice: totalPrice.toFixed(2),
        textsCount: order.texts.length,
        texts: order.texts.map((t) => ({
          topic: t.topic,
          length: t.length,
          language: t.language,
          textType: t.textType,
        })),
      });
    } catch (error) {
      console.error("❌ Slack notification failed:", error);
      // Nie blokujemy zamówienia jeśli Slack nie działa
    }

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
