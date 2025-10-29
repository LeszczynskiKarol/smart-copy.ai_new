// frontend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  email?: string;
  userId?: string;
  resent?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
  recaptchaToken: string;
}

export interface LoginData {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface ResendCodeData {
  email: string;
  recaptchaToken: string;
}

export interface ForgotPasswordData {
  email: string;
  recaptchaToken: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

// BLOG TYPES
export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: BlogPostStatus;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateBlogPostData {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: File;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: BlogPostStatus;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}
