// frontend/src/pages/DashboardPage.tsx

import { Layout } from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, FileText, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      icon: FileText,
      label: "Wygenerowane treści",
      value: "0",
      color: "from-purple-600 to-indigo-600",
    },
    {
      icon: TrendingUp,
      label: "Słowa tego miesiąca",
      value: "0",
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: Clock,
      label: "Zaoszczędzony czas",
      value: "0h",
      color: "from-orange-600 to-red-600",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Witaj, {user?.firstName || user?.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Gotowy do tworzenia wspaniałych treści?
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">
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

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Szybkie akcje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="btn btn-primary flex items-center justify-center gap-2 py-4">
                <Sparkles className="w-5 h-5" />
                Nowa treść AI
              </button>
              <button className="btn btn-secondary flex items-center justify-center gap-2 py-4">
                <FileText className="w-5 h-5" />
                Moje treści
              </button>
              <button className="btn btn-secondary flex items-center justify-center gap-2 py-4">
                <TrendingUp className="w-5 h-5" />
                Statystyki
              </button>
            </div>
          </motion.div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Rozpocznij swoją podróż z AI
                </h3>
                <p className="text-gray-600 mb-4">
                  Dowiedz się, jak w pełni wykorzystać Smart-Copy.ai i tworzyć
                  niesamowite treści w kilka sekund.
                </p>
                <button className="btn btn-primary">Obejrzyj samouczek</button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ostatnia aktywność
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Jeszcze nie utworzyłeś żadnych treści
              </p>
              <button className="btn btn-primary mt-4">
                Utwórz pierwszą treść
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};
