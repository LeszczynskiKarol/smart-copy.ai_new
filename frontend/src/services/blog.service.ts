// frontend/src/services/blog.service.ts
import { apiClient } from "@/lib/api";
import { BlogPost } from "@/types";

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RecentPost {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  publishedAt: string;
}

export const blogApi = {
  // Publiczne endpoints
  getPosts: async (page = 1, limit = 12): Promise<BlogListResponse> => {
    const { data } = await apiClient.get("/blog", {
      params: { page, limit },
    });
    return data;
  },

  getRecentPosts: async (limit = 3): Promise<RecentPost[]> => {
    const { data } = await apiClient.get("/blog/recent", {
      params: { limit },
    });
    return data;
  },

  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    const { data } = await apiClient.get(`/blog/${slug}`);
    return data;
  },

  // Admin endpoints - token automatycznie dołączany przez interceptor
  admin: {
    getAllPosts: async (
      page = 1,
      limit = 20,
      status?: string
    ): Promise<BlogListResponse> => {
      const { data } = await apiClient.get("/admin/blog", {
        params: { page, limit, status },
      });
      return data;
    },

    getPostById: async (id: string): Promise<BlogPost> => {
      const { data } = await apiClient.get(`/admin/blog/${id}`);
      return data;
    },

    createPost: async (formData: FormData) => {
      const { data } = await apiClient.post("/admin/blog", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },

    updatePost: async (id: string, formData: FormData) => {
      const { data } = await apiClient.put(`/admin/blog/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },

    deletePost: async (id: string) => {
      const { data } = await apiClient.delete(`/admin/blog/${id}`);
      return data;
    },
  },
};
