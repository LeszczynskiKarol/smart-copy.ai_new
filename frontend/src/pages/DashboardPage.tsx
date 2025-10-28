// frontend/src/pages/DashboardPage.tsx

import { UserSidebar } from "@/components/layout/UserSidebar";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";
import { capitalizeFirstLetter } from "@/utils/orderTitle";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShown = useRef(false);

  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data;
    },
  });

  // ✅ Zbierz wszystkie teksty ze wszystkich zamówień
  const allTexts = orders
    ? orders.flatMap((order: any) =>
        order.texts.map((text: any) => ({
          ...text,
          orderId: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
        }))
      )
    : [];

  // Sortuj od najnowszych i weź 3
  const recentTexts = allTexts
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  useEffect(() => {
    if (searchParams.get("payment") === "success" && !toastShown.current) {
      const amount = searchParams.get("amount");
      toast.success(
        `✅ Doładowanie zakończone sukcesem! Dodano ${amount} zł na konto.`,
        {
          duration: 5000,
          icon: "🎉",
        }
      );
      toastShown.current = true;
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const totalOrders = orders?.length || 0;
  const totalTexts =
    orders?.reduce((sum: number, order: any) => sum + order.texts.length, 0) ||
    0;
  const totalSpent =
    orders?.reduce(
      (sum: number, order: any) => sum + parseFloat(order.totalPrice),
      0
    ) || 0;

  const stats = [
    {
      icon: Package,
      label: "Zamówienia",
      value: totalOrders,
      color: "from-purple-600 to-indigo-600",
    },
    {
      icon: FileText,
      label: "Wygenerowane teksty",
      value: totalTexts,
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: Sparkles,
      label: "Wydane środki",
      value: `${totalSpent.toFixed(2)} zł`,
      color: "from-orange-600 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <UserSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Witaj, {user?.firstName || user?.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Gotowy do tworzenia wspaniałych treści?
            </p>
          </motion.div>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card dark:bg-gray-800 dark:border-gray-700 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Szybkie akcje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/orders?mode=new"
                className="btn btn-primary flex items-center justify-center gap-2 py-4"
              >
                <Sparkles className="w-5 h-5" />
                Złóż nowe zamówienie
              </Link>
              <Link
                to="/orders"
                className="btn btn-secondary flex items-center justify-center gap-2 py-4"
              >
                <Package className="w-5 h-5 " />
                Moje zamówienia
              </Link>
            </div>
          </motion.div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Texts - ✅ ZMIENIONA SEKCJA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ostatnie zamówienia
              </h2>
              <Link
                to="/orders"
                className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
              >
                Zobacz wszystkie
              </Link>
            </div>

            {recentTexts && recentTexts.length > 0 ? (
              <div className="space-y-3">
                {recentTexts.map((text: any) => (
                  <Link
                    key={text.id}
                    to={`/orders/${text.orderId}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {capitalizeFirstLetter(text.topic)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {text.pages}{" "}
                          {text.pages === 1
                            ? "strona"
                            : text.pages < 5
                            ? "strony"
                            : "stron"}{" "}
                          • {text.length.toLocaleString()} znaków
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-purple-600 dark:text-purple-400">
                        {parseFloat(text.price).toFixed(2)} zł
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(text.createdAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Jeszcze nie masz żadnych tekstów
                </p>
                <Link to="/orders?mode=new" className="btn btn-primary">
                  Zamów pierwszy tekst
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
