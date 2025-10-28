// backend/src/routes/text.routes.ts
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth.middleware";

export const textRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authenticateToken);

  // Update text content
  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { content: newHtmlContent } = request.body as { content: string };
    const user = request.user as { userId: string };

    // Sprawdź czy użytkownik ma dostęp do tego tekstu
    const text = await prisma.text.findFirst({
      where: {
        id,
        order: {
          userId: user.userId,
        },
      },
    });

    if (!text) {
      return reply.code(404).send({ error: "Text not found" });
    }

    // Pobierz istniejące dane
    const existingData = JSON.parse(text.content || "{}");

    // Zaktualizuj generatedContent
    existingData.generatedContent = newHtmlContent;
    existingData.lastEditedAt = new Date().toISOString();

    // Zapisz
    const updatedText = await prisma.text.update({
      where: { id },
      data: {
        content: JSON.stringify(existingData, null, 2),
      },
    });

    return { success: true, text: updatedText };
  });
};
