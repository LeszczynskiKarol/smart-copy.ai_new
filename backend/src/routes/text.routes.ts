// backend/src/routes/text.routes.ts
import { FastifyInstance } from "fastify";
import puppeteer from "puppeteer";
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

  fastify.get(
    "/:id/pdf",
    {
      onRequest: [authenticateToken],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = request.user as { userId: string };

        // Pobierz tekst
        const text = await prisma.text.findUnique({
          where: { id },
          include: {
            order: {
              select: {
                userId: true,
              },
            },
          },
        });

        if (!text) {
          return reply.code(404).send({ error: "Tekst nie znaleziony" });
        }

        // Sprawdź czy user ma dostęp
        if (text.order.userId !== user.userId) {
          return reply.code(403).send({ error: "Brak dostępu" });
        }

        const content = text.content ? JSON.parse(text.content) : null;
        const generatedContent = content?.generatedContent || "";

        if (!generatedContent) {
          return reply.code(400).send({ error: "Brak wygenerowanej treści" });
        }

        // ✅ GENERUJ PDF Z PUPPETEER
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser", // ← jawna ścieżka
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
          ],
        });

        const page = await browser.newPage();

        // ✅ HTML z pełnym formatowaniem i POLSKIMI ZNAKAMI
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="pl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${text.topic}</title>
            <style>
              @page {
                margin: 20mm;
                size: A4;
              }
              
              body { 
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #1f2937;
                max-width: 100%;
                margin: 0;
                padding: 20px;
              }
              
              h1 { 
                font-size: 24pt;
                font-weight: bold;
                margin: 20px 0 10px 0;
                color: #111827;
                page-break-after: avoid;
                line-height: 1.3;
              }
              
              h2 { 
                font-size: 20pt;
                font-weight: bold;
                margin: 16px 0 8px 0;
                color: #374151;
                page-break-after: avoid;
                line-height: 1.3;
              }
              
              h3 { 
                font-size: 16pt;
                font-weight: bold;
                margin: 12px 0 6px 0;
                color: #4b5563;
                page-break-after: avoid;
                line-height: 1.3;
              }
              
              p { 
                margin: 0 0 12px 0;
                text-align: justify;
                orphans: 3;
                widows: 3;
              }
              
              ul, ol { 
                margin: 8px 0 12px 20px;
                padding-left: 20px;
              }
              
              li { 
                margin: 4px 0;
                line-height: 1.5;
              }
              
              strong, b { 
                font-weight: bold;
                color: #1f2937;
              }
              
              em, i { 
                font-style: italic;
              }
              
              table {
                width: 100%;
                margin: 10px 0;
                border-collapse: collapse;
                page-break-inside: avoid;
              }
              
              th, td {
                border: 1px solid #d1d5db;
                padding: 8px;
                text-align: left;
              }
              
              th {
                background-color: #f3f4f6;
                font-weight: bold;
                color: #1f2937;
              }
              
              tr:nth-child(even) {
                background-color: #fafafa;
              }
              
              /* Page break hints */
              h1, h2, h3 {
                page-break-inside: avoid;
              }
              
              table, figure, img {
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            ${generatedContent}
          </body>
          </html>
        `;

        await page.setContent(fullHtml, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        // ✅ Generuj PDF z polskimi znakami
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
          margin: {
            top: "20mm",
            right: "15mm",
            bottom: "20mm",
            left: "15mm",
          },
        });

        await browser.close();

        // ✅ Wyślij PDF
        const filename = `${text.topic.replace(/[^a-z0-9]/gi, "_")}.pdf`;

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        reply.header("Content-Length", pdf.length);

        return reply.send(pdf);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "";

        fastify.log.error(`PDF generation error: ${errorMessage}`);
        fastify.log.error(`Stack: ${errorStack}`);
        console.error("Full PDF error:", error);

        return reply.code(500).send({
          error: "Błąd generowania PDF",
          details: errorMessage,
        });
      }
    }
  );

  // ✅ ENDPOINT DEBUG - SPRAWDŹ DŁUGOŚĆ TEKSTU
  fastify.get(
    "/:id/debug",
    {
      onRequest: [authenticateToken],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = request.user as { userId: string };

        const text = await prisma.text.findUnique({
          where: { id },
          include: {
            order: {
              select: {
                userId: true,
              },
            },
          },
        });

        if (!text) {
          return reply.code(404).send({ error: "Text not found" });
        }

        if (text.order.userId !== user.userId) {
          return reply.code(403).send({ error: "Brak dostępu" });
        }

        const contentData = text.content ? JSON.parse(text.content) : null;
        const generatedContent = contentData?.generatedContent || "";

        const stats = {
          textId: text.id,
          topic: text.topic,
          contentFieldLength: text.content?.length || 0,
          generatedContentLength: generatedContent.length,
          generatedContentStart: generatedContent.substring(0, 500),
          generatedContentEnd: generatedContent.substring(
            Math.max(0, generatedContent.length - 500)
          ),
          totalLines: generatedContent.split("\n").length,
          hasH1: generatedContent.includes("<h1>"),
          hasH2: generatedContent.includes("<h2>"),
          hasH3: generatedContent.includes("<h3>"),
          lastTag: generatedContent.match(/<\/[^>]+>$/)?.[0] || "NO TAG",
          endsProperlyWithClosingTag: generatedContent.trim().endsWith(">"),
        };

        return reply.send(stats);
      } catch (error) {
        fastify.log.error("Debug error:");
        return reply.code(500).send({ error: "Debug failed" });
      }
    }
  );
};
