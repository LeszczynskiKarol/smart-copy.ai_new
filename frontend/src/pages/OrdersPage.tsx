// frontend/src/pages/OrdersPage.tsx

import { useState, useEffect, useRef } from "react";
import { UserSidebar } from "@/components/layout/UserSidebar";
import { getOrderTitle } from "@/utils/orderTitle";
import { useNavigate } from "react-router-dom";
import { OrderForm } from "@/components/orders/OrderForm";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { ProgressBar } from "@/components/orders/ProgressBar";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Plus,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  texts: Array<{
    id: string;
    topic: string;
    length: number;
    pages: number;
    language: string;
    price: number;
    progress?: string | null;
    startTime?: string;
  }>;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      icon: Clock,
      label: "Oczekujące",
    },
    IN_PROGRESS: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: Package,
      label: "W realizacji",
    },
    COMPLETED: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: CheckCircle,
      label: "Zakończone",
    },
    CANCELLED: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      icon: XCircle,
      label: "Anulowane",
    },
  };

  const statusConfig = config[status as keyof typeof config] || config.PENDING;
  const Icon = statusConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusConfig.label}
    </span>
  );
};

export const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"list" | "new">("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const toastShownRef = useRef(false);
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data as Order[];
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasInProgress = data?.some(
        (o: Order) => o.status === "IN_PROGRESS"
      );
      return hasInProgress ? 5000 : false;
    },
  });

  useEffect(() => {
    if (!orders) return;

    const lastSeenKey = "last-seen-timestamp";
    const lastSeen = localStorage.getItem(lastSeenKey);
    const lastSeenDate = lastSeen ? new Date(lastSeen) : null;

    // Jeśli to pierwsza wizyta (brak lastSeen), nie pokazuj niczego
    if (!lastSeenDate) {
      localStorage.setItem(lastSeenKey, new Date().toISOString());
      return;
    }

    // Znajdź zamówienia ukończone od ostatniej wizyty
    const newlyCompleted = orders.filter((o) => {
      if (o.status !== "COMPLETED") return false;

      const completedAt = new Date(o.updatedAt || o.createdAt);
      return completedAt > lastSeenDate;
    });

    // Pokaż toasty tylko dla nowo ukończonych
    newlyCompleted.forEach((order) => {
      toast.success(`Zamówienie "${getOrderTitle(order)}" gotowe! 🎉`, {
        duration: 10000,
      });
    });

    // Zaktualizuj timestamp ostatniej wizyty
    localStorage.setItem(lastSeenKey, new Date().toISOString());
  }, [orders]);

  // Check URL params
  useEffect(() => {
    const mode = searchParams.get("mode");
    const payment = searchParams.get("payment");
    const orderId = searchParams.get("orderId");

    // CANCELLED + orderId = powrót z płatności zamówienia
    if (payment === "cancelled" && orderId) {
      setView("new"); // Pokaż formularz
    }
    // SUCCESS z orderId = opłacone zamówienie
    else if (payment === "success" && orderId && !toastShownRef.current) {
      toast.success("Zamówienie opłacone pomyślnie! 🎉");
      toastShownRef.current = true;
      setView("list");
      setSearchParams({});
      refetch();
    }
    // SUCCESS bez orderId = doładowanie konta
    else if (payment === "success" && !orderId) {
      setSearchParams({});
      setView("list"); // ← DODAJ
    }
    // mode=new = nowe zamówienie
    else if (mode === "new") {
      setView("new");
    }
    // DOMYŚLNIE = lista zamówień
    else {
      setView("list"); // ← KLUCZOWE!
    }
  }, [searchParams, setSearchParams, refetch]);

  const handleOrderSuccess = () => {
    setView("list");
    setSearchParams({});
    refetch();
  };

  const handleNewOrder = () => {
    setView("new");
    setSearchParams({ mode: "new" });
  };

  if (view === "new") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <UserSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <OrderForm onSuccess={handleOrderSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <UserSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Moje zamówienia
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Zarządzaj swoimi zamówieniami treści AI
              </p>
            </div>
            <button
              onClick={handleNewOrder}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nowe zamówienie
            </button>
          </div>
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">
                Ładowanie zamówień...
              </div>
            </div>
          )}
          {/* Empty State */}
          {!isLoading && (!orders || orders.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card dark:bg-gray-800 dark:border-gray-700 text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Brak aktywnych zamówień
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Nie masz jeszcze żadnych zamówień w realizacji lub zakończonych.
                Złóż pierwsze zamówienie!
              </p>
              <button
                onClick={handleNewOrder}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Złóż pierwsze zamówienie
              </button>
            </motion.div>
          )}
          {/* Orders List */}
          {!isLoading && orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {getOrderTitle(order)}
                        </h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {order.orderNumber}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "pl-PL"
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {order.texts.length}{" "}
                          {order.texts.length === 1
                            ? "tekst"
                            : order.texts.length < 5
                            ? "teksty"
                            : "tekstów"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {parseFloat(order.totalPrice.toString()).toFixed(2)} zł
                      </div>
                    </div>
                  </div>

                  {/* Texts Preview */}
                  <div className="border-t mb-4 border-gray-200 dark:border-gray-700 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.texts.slice(0, 2).map((text) => (
                        <div
                          key={text.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {text.topic}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {text.pages} str. • {text.length.toLocaleString()}{" "}
                            znaków • {text.language.toUpperCase()}
                          </p>
                        </div>
                      ))}
                      {order.texts.length > 2 && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            + {order.texts.length - 2} więcej
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Progress bars for IN_PROGRESS orders */}
                  {order.status === "IN_PROGRESS" && (
                    <div className="mt-4 space-y-3">
                      {order.texts.map((text) => (
                        <div key={text.id}>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.topic}
                          </p>
                          <ProgressBar
                            progress={text.progress}
                            textLength={text.length}
                            startTime={text.startTime}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {order.status === "COMPLETED" ? (
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="btn btn-primary text-sm mb-2 w-80"
                    >
                      Otwórz zamówienie
                    </button>
                  ) : null}
                </motion.div>
              ))}
            </div>
          )}
          {/* Order Details Modal */}
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="card dark:bg-gray-800 dark:border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedOrder.orderNumber}
                    </h2>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Data złożenia
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "pl-PL"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Liczba tekstów
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedOrder.texts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Suma
                      </p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {parseFloat(
                          selectedOrder.totalPrice.toString()
                        ).toFixed(2)}{" "}
                        zł
                      </p>
                    </div>
                  </div>

                  {/* Texts */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Zamówione teksty
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.texts.map((text, index) => (
                        <div
                          key={text.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {text.topic}
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span>📄 {text.pages} stron</span>
                                <span>
                                  ✍️ {text.length.toLocaleString()} znaków
                                </span>
                                <span>🌍 {text.language.toUpperCase()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {parseFloat(text.price.toString()).toFixed(2)}{" "}
                                zł
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
