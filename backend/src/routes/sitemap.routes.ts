// backend/src/routes/sitemap.routes.ts
import { FastifyInstance } from "fastify";
import { SitemapService } from "../services/sitemap.service";

const sitemapService = new SitemapService();

export async function sitemapRoutes(fastify: FastifyInstance) {
  // Sitemap XML
  fastify.get("/sitemap.xml", async (request, reply) => {
    try {
      const sitemap = await sitemapService.generateSitemap();

      reply
        .header("Content-Type", "application/xml")
        .header("Cache-Control", "public, max-age=3600") // Cache na 1h
        .send(sitemap);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Błąd podczas generowania sitemapy",
      });
    }
  });

  // Robots.txt
  fastify.get("/robots.txt", async (request, reply) => {
    try {
      const robotsTxt = sitemapService.generateRobotsTxt();

      reply
        .header("Content-Type", "text/plain")
        .header("Cache-Control", "public, max-age=86400") // Cache na 24h
        .send(robotsTxt);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Błąd podczas generowania robots.txt",
      });
    }
  });
}
