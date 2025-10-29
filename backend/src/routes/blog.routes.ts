// backend/src/routes/blog.routes.ts
import { FastifyInstance } from "fastify";
import { BlogService } from "../services/blog.service";

const blogService = new BlogService();

export async function blogRoutes(fastify: FastifyInstance) {
  // Pobieranie wszystkich opublikowanych artykułów
  fastify.get("/", async (request, reply) => {
    try {
      const { page = "1", limit = "12" } = request.query as {
        page?: string;
        limit?: string;
      };

      const result = await blogService.getPublishedPosts(
        parseInt(page),
        parseInt(limit)
      );

      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas pobierania artykułów",
      });
    }
  });

  // Pobieranie ostatnich artykułów (sidebar)
  fastify.get("/recent", async (request, reply) => {
    try {
      const { limit = "3" } = request.query as { limit?: string };

      const posts = await blogService.getRecentPosts(parseInt(limit));

      return reply.code(200).send(posts);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas pobierania ostatnich artykułów",
      });
    }
  });

  // Pobieranie pojedynczego artykułu po slug
  fastify.get("/:slug", async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };

      const post = await blogService.getPostBySlug(slug);

      return reply.code(200).send(post);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas pobierania artykułu",
      });
    }
  });
}
