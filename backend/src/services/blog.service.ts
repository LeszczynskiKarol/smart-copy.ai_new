// backend/src/services/blog.service.ts
import { PrismaClient, BlogPostStatus } from "@prisma/client";
import { AppError } from "../utils/helpers";
import { uploadToS3, deleteFromS3 } from "./s3.service";

const prisma = new PrismaClient();

interface CreateBlogPostInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: Buffer;
  coverImageName?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: BlogPostStatus;
  publishedAt?: Date;
  authorId: string;
}

interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

export class BlogService {
  // Generowanie slug z tytułu
  private generateSlug(title: string): string {
    const polishCharsMap: Record<string, string> = {
      ą: "a",
      ć: "c",
      ę: "e",
      ł: "l",
      ń: "n",
      ó: "o",
      ś: "s",
      ź: "z",
      ż: "z",
      Ą: "A",
      Ć: "C",
      Ę: "E",
      Ł: "L",
      Ń: "N",
      Ó: "O",
      Ś: "S",
      Ź: "Z",
      Ż: "Z",
    };

    let slug = title.toLowerCase();

    // Zamiana polskich znaków
    Object.keys(polishCharsMap).forEach((char) => {
      slug = slug.replace(new RegExp(char, "g"), polishCharsMap[char]);
    });

    // Pozostałe znaki niealfanumeryczne na myślniki
    slug = slug
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);

    return slug;
  }

  // Zapewnienie unikalności slug
  private async ensureUniqueSlug(
    slug: string,
    excludeId?: string
  ): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  // Tworzenie artykułu
  async createPost(data: CreateBlogPostInput) {
    const {
      title,
      excerpt,
      content,
      coverImage,
      coverImageName,
      metaTitle,
      metaDescription,
      keywords,
      status,
      publishedAt,
      authorId,
    } = data;

    // Generowanie slug
    const baseSlug = this.generateSlug(title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Upload zdjęcia do S3 jeśli jest
    let coverImageUrl: string | undefined;
    if (coverImage && coverImageName) {
      const s3Key = `blog-covers/${Date.now()}-${coverImageName}`;
      coverImageUrl = await uploadToS3(coverImage, s3Key, "image/jpeg");
    }

    // Tworzenie posta
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImageUrl,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords,
        status,
        publishedAt:
          status === "PUBLISHED" && !publishedAt ? new Date() : publishedAt,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  // Aktualizacja artykułu
  async updatePost(data: UpdateBlogPostInput) {
    const { id, title, coverImage, coverImageName, ...updateData } = data;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new AppError(404, "Artykuł nie został znaleziony");
    }

    // Jeśli zmienia się tytuł, generuj nowy slug
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      const baseSlug = this.generateSlug(title);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    // Upload nowego zdjęcia jeśli jest
    let coverImageUrl = existingPost.coverImage;
    if (coverImage && coverImageName) {
      // Usuń stare zdjęcie z S3
      if (existingPost.coverImage) {
        const oldKey = existingPost.coverImage.split(".com/")[1];
        if (oldKey) {
          await deleteFromS3(oldKey);
        }
      }

      const s3Key = `blog-covers/${Date.now()}-${coverImageName}`;
      coverImageUrl = await uploadToS3(coverImage, s3Key, "image/jpeg");
    }

    // Aktualizacja statusu publikacji
    const publishedAt =
      updateData.status === "PUBLISHED" && !existingPost.publishedAt
        ? new Date()
        : existingPost.publishedAt;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title && { title, slug }),
        ...updateData,
        coverImage: coverImageUrl,
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  // Usuwanie artykułu
  async deletePost(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError(404, "Artykuł nie został znaleziony");
    }

    // Usuń zdjęcie z S3
    if (post.coverImage) {
      const s3Key = post.coverImage.split(".com/")[1];
      if (s3Key) {
        await deleteFromS3(s3Key);
      }
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return { message: "Artykuł został usunięty" };
  }

  // Pobieranie wszystkich artykułów (admin)
  async getAllPosts(page = 1, limit = 20, status?: BlogPostStatus) {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Pobieranie opublikowanych artykułów (public)
  async getPublishedPosts(page = 1, limit = 12) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Pobieranie ostatnich 3 artykułów dla sidebara
  async getRecentPosts(limit = 3) {
    return prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
      },
    });
  }

  // Pobieranie artykułu po slug (public)
  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post || post.status !== "PUBLISHED") {
      throw new AppError(404, "Artykuł nie został znaleziony");
    }

    // Zwiększ licznik wyświetleń
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  // Pobieranie artykułu po ID (admin)
  async getPostById(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError(404, "Artykuł nie został znaleziony");
    }

    return post;
  }
}
