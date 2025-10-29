// frontend/src/pages/BlogListPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { blogApi } from "@/services/blog.service";
import {
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export const BlogListPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "posts", page],
    queryFn: () => blogApi.getPosts(page),
  });

  return (
    <>
      <Helmet>
        <title>Blog - Smart-Copy.AI | Artykuły o copywritingu i AI</title>
        <meta
          name="description"
          content="Czytaj najnowsze artykuły o copywritingu, content marketingu i wykorzystaniu sztucznej inteligencji w tworzeniu treści."
        />
        <meta
          name="keywords"
          content="blog copywriting, artykuły AI, content marketing, pisanie tekstów"
        />
      </Helmet>

      <Layout>
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Blog Smart-Copy.AI
                </h1>
                <p className="text-xl text-indigo-100 dark:text-indigo-200 leading-relaxed">
                  Odkryj najlepsze praktyki copywritingu, content marketingu i
                  wykorzystania AI w tworzeniu treści, które sprzedają.
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 dark:bg-gray-700 rounded-xl h-64 mb-4" />
                    <div className="space-y-3">
                      <div className="bg-slate-200 dark:bg-gray-700 h-6 rounded w-3/4" />
                      <div className="bg-slate-200 dark:bg-gray-700 h-4 rounded w-full" />
                      <div className="bg-slate-200 dark:bg-gray-700 h-4 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {data?.posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col h-full"
                    >
                      {/* Cover Image */}
                      {post.coverImage && (
                        <Link
                          to={`/blog/${post.slug}`}
                          className="block overflow-hidden"
                        >
                          <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-gray-700">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </Link>
                      )}

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {format(
                                new Date(post.publishedAt!),
                                "d MMM yyyy",
                                {
                                  locale: pl,
                                }
                              )}
                            </span>
                          </div>
                          {post.author && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {post.author.firstName} {post.author.lastName}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <Link to={`/blog/${post.slug}`} className="mb-3 block">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h2>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-slate-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed text-sm flex-1">
                          {post.excerpt}
                        </p>

                        {/* Read More */}
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group/link mt-auto"
                        >
                          Czytaj więcej
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-200 dark:border-gray-700">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Poprzednia
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: data.pagination.pages },
                        (_, i) => i + 1
                      )
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === data.pagination.pages ||
                            Math.abs(p - page) <= 1
                        )
                        .map((p, i, arr) => (
                          <div key={p} className="flex items-center">
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="px-2 text-slate-400 dark:text-gray-500 font-medium">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`min-w-[44px] h-11 rounded-lg font-semibold transition-all ${
                                p === page
                                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/20 scale-105"
                                  : "bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500"
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(data.pagination.pages, p + 1))
                      }
                      disabled={page === data.pagination.pages}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Następna
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {data?.posts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Brak artykułów
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">
                      Wkrótce pojawią się tutaj nowe artykuły
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};
