// frontend/src/pages/BlogPostPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { blogApi } from "@/services/blog.service";
import { Calendar, User, Eye, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => blogApi.getPostBySlug(slug!),
    enabled: !!slug,
  });

  // ✅ SIDEBAR - pobieranie ostatnich postów
  const { data: recentPosts } = useQuery({
    queryKey: ["blog", "recent"],
    queryFn: () => blogApi.getRecentPosts(3),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="animate-pulse space-y-6">
              <div className="bg-slate-200 h-96 rounded-xl" />
              <div className="space-y-3">
                <div className="bg-slate-200 h-8 rounded w-3/4" />
                <div className="bg-slate-200 h-4 rounded w-1/2" />
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="bg-slate-200 h-64 rounded-xl animate-pulse" />
            </aside>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Artykuł nie został znaleziony
          </h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do bloga
          </Link>
        </div>
      </Layout>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: `${post.author.firstName} ${post.author.lastName}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Smart-Copy.AI",
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/logo.png`,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title}</title>
        <meta
          name="description"
          content={post.metaDescription || post.excerpt}
        />
        {post.keywords && <meta name="keywords" content={post.keywords} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.coverImage && (
          <meta property="og:image" content={post.coverImage} />
        )}
        <meta
          property="og:url"
          content={`${window.location.origin}/blog/${post.slug}`}
        />
        <meta property="article:published_time" content={post.publishedAt!} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta
          property="article:author"
          content={`${post.author.firstName} ${post.author.lastName}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.coverImage && (
          <meta name="twitter:image" content={post.coverImage} />
        )}
        <link
          rel="canonical"
          href={`${window.location.origin}/blog/${post.slug}`}
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* ✅ GŁÓWNA TREŚĆ */}
            <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
              {post.coverImage && (
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              <div className="p-8 md:p-12">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wróć do bloga
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-8 pb-8 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">
                      {post.author.firstName} {post.author.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <time dateTime={post.publishedAt!}>
                      {format(new Date(post.publishedAt!), "d MMMM yyyy", {
                        locale: pl,
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>{post.viewCount} wyświetleń</span>
                  </div>
                </div>

                <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                  {post.excerpt}
                </p>

                <div
                  className="prose prose-lg prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-8 prose-headings:mb-4
                    prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-em:text-slate-700 prose-em:italic
                    prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
                    prose-li:text-slate-700 prose-li:my-2
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
                    prose-code:text-indigo-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                    prose-hr:border-slate-300 prose-hr:my-8
                    prose-table:border-collapse prose-table:w-full
                    prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold
                    prose-td:border prose-td:border-slate-300 prose-td:p-3"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-12 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Udostępnij artykuł
                  </h3>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Facebook
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        window.location.href
                      )}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
                    >
                      Twitter
                    </a>

                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* ✅ SIDEBAR */}
            <aside className="hidden lg:block space-y-6">
              {/* Ostatnie artykuły */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Ostatnie artykuły
                </h3>
                {recentPosts && recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((recentPost) => (
                      <Link
                        key={recentPost.id}
                        to={`/blog/${recentPost.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {recentPost.coverImage && (
                            <img
                              src={recentPost.coverImage}
                              alt={recentPost.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm mb-1">
                              {recentPost.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {format(
                                new Date(recentPost.publishedAt!),
                                "d MMM yyyy",
                                { locale: pl }
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Brak artykułów</p>
                )}
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Newsletter</h3>
                <p className="text-sm opacity-90 mb-4">
                  Otrzymuj najnowsze artykuły prosto na skrzynkę!
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Twój email"
                    className="w-full px-4 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-indigo-600 font-semibold py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Zapisz się
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </Layout>
    </>
  );
};
