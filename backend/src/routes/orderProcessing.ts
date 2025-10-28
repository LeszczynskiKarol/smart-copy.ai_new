// backend/src/routes/orderProcessing.ts
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  generateGoogleQuery,
  searchGoogle,
} from "../services/textGenerationService";

const prisma = new PrismaClient();

export default async function orderProcessingRoutes(fastify: FastifyInstance) {
  // POST /api/orders/:orderId/process
  fastify.post("/:orderId/process", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { texts: true },
    });

    if (!order) {
      return reply.status(404).send({ error: "Zamówienie nie znalezione" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "IN_PROGRESS" },
    });

    const results = [];

    for (const text of order.texts) {
      console.log(`\n🔄 Przetwarzam: ${text.topic}`);

      const googleQuery = await generateGoogleQuery(text);
      console.log(`✅ Zapytanie: "${googleQuery}"`);

      const searchResults = await searchGoogle(googleQuery, text.language);
      console.log(`✅ Wyników: ${searchResults.totalResults}`);

      results.push({
        textId: text.id,
        topic: text.topic,
        googleQuery,
        resultsCount: searchResults.totalResults,
        urls: searchResults.items.map((item: any) => item.link),
      });
    }

    return reply.send({
      success: true,
      orderId,
      textsProcessed: results.length,
      results,
    });
  });
}
