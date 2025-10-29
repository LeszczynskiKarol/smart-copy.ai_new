// backend/src/routes/admin-blog.routes.ts
import { FastifyInstance } from "fastify";
import { BlogService } from "../services/blog.service";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { BlogPostStatus } from "@prisma/client";

const blogService = new BlogService();

export async function adminBlogRoutes(fastify: FastifyInstance) {
  // Middleware - wymagane logowanie jako admin
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireAdmin);

  // Pobieranie wszystkich artykułów (admin)
  fastify.get("/", async (request, reply) => {
    try {
      const {
        page = "1",
        limit = "20",
        status,
      } = request.query as {
        page?: string;
        limit?: string;
        status?: BlogPostStatus;
      };

      const result = await blogService.getAllPosts(
        parseInt(page),
        parseInt(limit),
        status
      );

      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas pobierania artykułów",
      });
    }
  });

  // Pobieranie pojedynczego artykułu po ID (admin)
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const post = await blogService.getPostById(id);

      return reply.code(200).send(post);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas pobierania artykułu",
      });
    }
  });

  // Tworzenie artykułu
  fastify.post("/", async (request, reply) => {
    try {
      const fields: Record<string, any> = {};
      let coverImageBuffer: Buffer | undefined;
      let coverImageName: string | undefined;

      // ✅ POPRAWKA - użyj TYLKO parts()
      for await (const part of request.parts()) {
        if (part.type === "file" && part.fieldname === "coverImage") {
          coverImageBuffer = await part.toBuffer();
          coverImageName = part.filename;
        } else if (part.type === "field") {
          fields[part.fieldname] = part.value;
        }
      }

      if (!fields.title || !fields.excerpt || !fields.content) {
        return reply.code(400).send({
          error: "Tytuł, zajawka i treść są wymagane",
        });
      }

      const post = await blogService.createPost({
        title: fields.title,
        excerpt: fields.excerpt,
        content: fields.content,
        coverImage: coverImageBuffer,
        coverImageName: coverImageName,
        metaTitle: fields.metaTitle,
        metaDescription: fields.metaDescription,
        keywords: fields.keywords,
        status: fields.status || "DRAFT",
        publishedAt: fields.publishedAt
          ? new Date(fields.publishedAt)
          : undefined,
        authorId: (request.user as any).userId,
      });

      return reply.code(201).send({
        message: "Artykuł został utworzony",
        post,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas tworzenia artykułu",
      });
    }
  });

  // ✅ Aktualizacja artykułu - POPRAWIONA
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const fields: Record<string, any> = {};
      let coverImageBuffer: Buffer | undefined;
      let coverImageName: string | undefined;

      // ✅ POPRAWKA - użyj TYLKO parts()
      for await (const part of request.parts()) {
        if (part.type === "file" && part.fieldname === "coverImage") {
          coverImageBuffer = await part.toBuffer();
          coverImageName = part.filename;
        } else if (part.type === "field") {
          fields[part.fieldname] = part.value;
        }
      }

      const updateData: any = { id };
      if (fields.title) updateData.title = fields.title;
      if (fields.excerpt) updateData.excerpt = fields.excerpt;
      if (fields.content) updateData.content = fields.content;
      if (fields.metaTitle) updateData.metaTitle = fields.metaTitle;
      if (fields.metaDescription)
        updateData.metaDescription = fields.metaDescription;
      if (fields.keywords) updateData.keywords = fields.keywords;
      if (fields.status) updateData.status = fields.status as BlogPostStatus;
      if (coverImageBuffer) {
        updateData.coverImage = coverImageBuffer;
        updateData.coverImageName = coverImageName;
      }

      const post = await blogService.updatePost(updateData);

      return reply.code(200).send({
        message: "Artykuł został zaktualizowany",
        post,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas aktualizacji artykułu",
      });
    }
  });

  // Usuwanie artykułu
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await blogService.deletePost(id);

      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Błąd podczas usuwania artykułu",
      });
    }
  });
}
