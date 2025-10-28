// frontend/src/pages/admin/AdminOrderDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiClient } from "@/lib/api";
import { ArrowLeft, FileText } from "lucide-react";
import { ProgressBar } from "@/components/orders/ProgressBar";
import { motion } from "framer-motion";

export const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/orders/${id}`);
      return res.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "IN_PROGRESS" ? 5000 : false;
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          Ładowanie...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Zamówienie nie znalezione</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn btn-primary"
          >
            Wróć do zamówień
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 text-purple-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do zamówień
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {order.orderNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Użytkownik: {order.user.email}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Data: {new Date(order.createdAt).toLocaleDateString("pl-PL")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            Teksty ({order.texts.length})
          </h2>

          {order.texts.map((text: any, index: number) => (
            <motion.div
              key={text.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold">{text.topic}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 ml-11">
                    <span>📄 {text.pages} stron</span>
                    <span>✍️ {text.length.toLocaleString()} znaków</span>
                    <span>🌍 {text.language.toUpperCase()}</span>
                    <span>📝 {text.textType}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/texts/${text.id}`)}
                  className="btn btn-primary flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Szczegóły
                </button>
              </div>

              {/* Progress bar */}
              {text.progress && text.progress !== "completed" && (
                <ProgressBar
                  progress={text.progress}
                  textLength={text.length}
                  startTime={text.startTime}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
