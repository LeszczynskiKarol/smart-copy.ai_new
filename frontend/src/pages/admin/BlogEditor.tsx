// frontend/src/pages/admin/BlogEditor.tsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { blogApi } from "@/services/blog.service";
import { BlogPost, BlogPostStatus } from "@/types";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";

export const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id && id !== "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    status: "DRAFT" as BlogPostStatus,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  const { data: post } = useQuery<BlogPost, Error>({
    queryKey: ["admin", "blog", "post", id],
    queryFn: () => blogApi.admin.getPostById(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        keywords: post.keywords || "",
        status: post.status,
      });
      if (post.coverImage) {
        setCoverImagePreview(post.coverImage);
      }
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditMode && id) {
        return blogApi.admin.updatePost(id, data);
      }
      return blogApi.admin.createPost(data);
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Artykuł został zaktualizowany"
          : "Artykuł został utworzony"
      );
      navigate("/admin/blog");
    },
    onError: () => {
      toast.error("Nie udało się zapisać artykułu");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB");
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent, status?: BlogPostStatus) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Tytuł jest wymagany");
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error("Zajawka jest wymagana");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Treść artykułu jest wymagana");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("metaTitle", formData.metaTitle || formData.title);
    data.append(
      "metaDescription",
      formData.metaDescription || formData.excerpt
    );
    data.append("keywords", formData.keywords);
    data.append("status", status || formData.status);

    if (coverImage) {
      data.append("coverImage", coverImage);
    }

    saveMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/blog")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót do listy artykułów
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditMode ? "Edytuj artykuł" : "Nowy artykuł"}
            </h1>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Zdjęcie główne
              </label>
              <div className="space-y-4">
                {coverImagePreview && (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImagePreview("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="coverImage"
                />
                <label
                  htmlFor="coverImage"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {coverImagePreview
                      ? "Zmień zdjęcie"
                      : "Dodaj zdjęcie (max 5MB)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tytuł artykułu *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Wprowadź tytuł artykułu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Zajawka / Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Krótki opis artykułu (1-2 zdania)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Treść artykułu * (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={20}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="<p>Treść artykułu w formacie HTML...</p>"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Możesz używać HTML do formatowania tekstu
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Ustawienia SEO
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Jeśli puste, użyty zostanie tytuł artykułu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Jeśli puste, użyta zostanie zajawka"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Słowa kluczowe
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="copywriting, AI, content marketing"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Oddziel przecinkami
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow p-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as BlogPostStatus,
                    })
                  }
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="DRAFT">Szkic</option>
                  <option value="PUBLISHED">Opublikowany</option>
                  <option value="ARCHIVED">Zarchiwizowany</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "DRAFT")}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Zapisz jako szkic
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "PUBLISHED")}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  Opublikuj
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
