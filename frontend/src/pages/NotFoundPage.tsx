// frontend/src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Strona nie znaleziona | Smart-Copy.ai</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-2xl">
            <div className="text-9xl font-bold text-purple-600 dark:text-purple-400 mb-4">
              404
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Strona nie została znaleziona
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Przepraszamy, ale strona której szukasz nie istnieje lub została
              przeniesiona.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Strona główna
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
