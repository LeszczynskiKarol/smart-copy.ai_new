// frontend/src/pages/admin/BlogManagement.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Link } from "react-router-dom";
import { blogApi } from "@/services/blog.service";
import toast from "react-hot-toast";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export const BlogManagement = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog", page, statusFilter],
    queryFn: () => blogApi.admin.getAllPosts(page, 20, statusFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.admin.deletePost,
    onSuccess: () => {
      toast.success("Artykuł został usunięty");
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
    onError: () => {
      toast.error("Nie udało się usunąć artykułu");
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (
      window.confirm(
        `Czy na pewno chcesz usunąć artykuł "${title}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPosts = data?.posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Zarządzanie blogiem
                </h1>
                <p className="text-slate-600 mt-1">
                  Twórz i edytuj artykuły blogowe
                </p>
              </div>
              <Link
                to="/admin/blog/new"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                Nowy artykuł
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj po tytule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Wszystkie statusy</option>
                  <option value="DRAFT">Szkic</option>
                  <option value="PUBLISHED">Opublikowany</option>
                  <option value="ARCHIVED">Zarchiwizowany</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Posts Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Tytuł
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Opublikowany
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Wyświetlenia
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Akcje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPosts?.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {post.title}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {post.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                post.status === "PUBLISHED"
                                  ? "bg-green-100 text-green-800"
                                  : post.status === "DRAFT"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {post.status === "PUBLISHED"
                                ? "Opublikowany"
                                : post.status === "DRAFT"
                                ? "Szkic"
                                : "Zarchiwizowany"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {post.publishedAt ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  new Date(post.publishedAt),
                                  "d MMM yyyy",
                                  {
                                    locale: pl,
                                  }
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.viewCount}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {post.status === "PUBLISHED" && (
                                <a
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Zobacz artykuł"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <Link
                                to={`/admin/blog/${post.id}/edit`}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edytuj"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(post.id, post.title)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Usuń"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredPosts?.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Brak artykułów
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Zacznij tworzyć artykuły blogowe
                    </p>
                    <Link
                      to="/admin/blog/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Dodaj pierwszy artykuł
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {data && data.pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {Array.from(
                    { length: data.pagination.pages },
                    (_, i) => i + 1
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
