// frontend/src/pages/admin/AdminDashboard.tsx

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiClient } from "@/lib/api";
import {
  Users,
  Package,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  users: {
    total: number;
    verified: number;
    unverified: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
  };
  blog: {
    total: number;
    published: number;
    drafts: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
}

export const AdminDashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/stats");
      return data;
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
              />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Przegląd systemu Smart-Copy.AI
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stat */}
          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.users.total || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Użytkownicy
            </p>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600 dark:text-green-400">
                ✓ {stats?.users.verified || 0} zweryfikowanych
              </span>
              <span className="text-gray-500">
                {stats?.users.unverified || 0} oczekujących
              </span>
            </div>
          </Link>

          {/* Orders Stat */}
          <Link
            to="/admin/orders"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.orders.total || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Zamówienia
            </p>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600 dark:text-green-400">
                ✓ {stats?.orders.completed || 0} ukończonych
              </span>
              <span className="text-orange-500">
                {stats?.orders.pending || 0} w toku
              </span>
            </div>
          </Link>

          {/* Blog Stat */}
          <Link
            to="/admin/blog"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.blog.total || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Artykuły
            </p>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600 dark:text-green-400">
                ✓ {stats?.blog.published || 0} opublikowanych
              </span>
              <span className="text-gray-500">
                {stats?.blog.drafts || 0} szkiców
              </span>
            </div>
          </Link>

          {/* Revenue Stat */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats?.revenue.total || 0} PLN
            </h3>
            <p className="text-sm text-green-100 mb-2">Przychody całkowite</p>
            <div className="text-xs text-green-100">
              Ten miesiąc: {stats?.revenue.thisMonth || 0} PLN
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Szybkie akcje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/blog/new"
              className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Nowy artykuł
              </span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Zarządzaj użytkownikami
              </span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Zobacz zamówienia
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Ostatnie zamówienia
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Zobacz wszystkie
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Zamówienie #1234
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    W trakcie realizacji
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Ostatnie artykuły
              </h2>
              <Link
                to="/admin/blog"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Zobacz wszystkie
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Brak artykułów
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dodaj pierwszy artykuł
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
