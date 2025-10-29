// backend/src/services/sitemap.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

export class SitemapService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || "https://smart-copy.ai";
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // 1. Strony statyczne (indeksowane)
    urls.push({
      loc: `${this.baseUrl}/`,
      changefreq: "daily",
      priority: 1.0,
      lastmod: this.formatDate(new Date()),
    });

    urls.push({
      loc: `${this.baseUrl}/blog`,
      changefreq: "daily",
      priority: 0.9,
      lastmod: this.formatDate(new Date()),
    });

    urls.push({
      loc: `${this.baseUrl}/ai-generator-opisow-produktow`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: this.formatDate(new Date()),
    });

    urls.push({
      loc: `${this.baseUrl}/ai-copywriter`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: this.formatDate(new Date()),
    });

    // 2. Pobierz wszystkie opublikowane posty blogowe
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    // 3. Dodaj posty blogowe do sitemapy
    posts.forEach((post) => {
      urls.push({
        loc: `${this.baseUrl}/blog/${this.escapeXml(post.slug)}`,
        lastmod: this.formatDate(post.updatedAt),
        changefreq: "monthly",
        priority: 0.7,
      });
    });

    // 4. Generuj XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((url) => {
      xml += "  <url>\n";
      xml += `    <loc>${url.loc}</loc>\n`;
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      if (url.priority !== undefined) {
        xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      xml += "  </url>\n";
    });

    xml += "</urlset>";

    return xml;
  }

  // robots.txt generator
  generateRobotsTxt(): string {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /orders
Disallow: /deposit
Disallow: /login
Disallow: /register
Disallow: /verify
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /api/

Sitemap: ${this.baseUrl}/sitemap.xml`;

    return robotsTxt;
  }
}
