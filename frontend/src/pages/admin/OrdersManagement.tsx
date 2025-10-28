// frontend/src/pages/admin/OrdersManagement.tsx
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Edit, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Komponent do pokazywania tytułu zamówienia
const OrderTitle = ({
  texts,
  orderId,
  onNavigate,
}: {
  texts: any[];
  orderId: string;
  onNavigate: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!texts || texts.length === 0) return <span>Brak tekstów</span>;

  const firstTopic = texts[0].topic;
  const words = firstTopic.split(" ");
  const shortTitle =
    words.length <= 5 ? firstTopic : words.slice(0, 5).join(" ");
  const hasMore = words.length > 5;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onNavigate(orderId)}
        className="font-medium hover:text-purple-600 text-left"
      >
        {expanded ? firstTopic : shortTitle}
        {!expanded && hasMore && "..."}
      </button>
      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-purple-600 hover:text-purple-700 text-xs"
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
};

export const OrdersManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editOrder, setEditOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/orders");
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status?: string;
      notes?: string;
    }) => {
      await apiClient.patch(`/admin/orders/${id}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Zamówienie zaktualizowane");
      setEditOrder(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.delete(`/admin/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Zamówienie usunięte");
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Zamówienia</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Numer
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tytuł
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Użytkownik
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Teksty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Cena
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Data
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders?.map((order: any) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <OrderTitle
                    texts={order.texts}
                    orderId={order.id}
                    onNavigate={(id) => navigate(`/admin/orders/${id}`)}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {order.user.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {order.texts.length}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-purple-600">
                  {parseFloat(order.totalPrice).toFixed(2)} zł
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="text-blue-600 hover:underline"
                      title="Zobacz szczegóły"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditOrder(order);
                      }}
                      className="text-purple-600 hover:underline"
                      title="Edytuj"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Usunąć zamówienie ${order.orderNumber}? ${
                              order.status !== "PENDING"
                                ? "Środki zostaną zwrócone użytkownikowi."
                                : ""
                            }`
                          )
                        ) {
                          deleteMutation.mutate(order.id);
                        }
                      }}
                      className="text-red-600 hover:underline"
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

      {/* Edit Modal */}
      {editOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setEditOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edytuj {editOrder.orderNumber}
            </h3>
            <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
              Status:
            </label>
            <select
              value={editOrder.status}
              onChange={(e) =>
                setEditOrder({ ...editOrder, status: e.target.value })
              }
              className="input w-full mb-4"
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
              Notatki:
            </label>
            <textarea
              value={editOrder.notes || ""}
              onChange={(e) =>
                setEditOrder({ ...editOrder, notes: e.target.value })
              }
              className="input w-full mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: editOrder.id,
                    status: editOrder.status,
                    notes: editOrder.notes,
                  })
                }
                className="btn btn-primary flex-1"
              >
                Zapisz
              </button>
              <button
                onClick={() => setEditOrder(null)}
                className="btn btn-secondary flex-1"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
