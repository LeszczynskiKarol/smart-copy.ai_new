// frontend/src/pages/admin/UsersManagement.tsx

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editBalanceUser, setEditBalanceUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [balanceReason, setBalanceReason] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/users");
      return res.data;
    },
  });

  // Fetch user details with orders
  const { data: userDetails } = useQuery({
    queryKey: ["admin-user-details", expandedUser],
    queryFn: async () => {
      if (!expandedUser) return null;
      const res = await apiClient.get(`/admin/users/${expandedUser}`);
      return res.data;
    },
    enabled: !!expandedUser,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
  });

  const balanceMutation = useMutation({
    mutationFn: async ({
      userId,
      amount,
      reason,
    }: {
      userId: string;
      amount: number;
      reason: string;
    }) => {
      await apiClient.patch(`/admin/users/${userId}/balance`, {
        amount,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details"] });
      toast.success("Balance updated");
      setEditBalanceUser(null);
      setBalanceAmount(0);
      setBalanceReason("");
    },
  });

  const handleBalanceSubmit = () => {
    if (!balanceReason.trim()) {
      toast.error("Podaj powód zmiany salda");
      return;
    }

    balanceMutation.mutate({
      userId: editBalanceUser.id,
      amount: balanceAmount,
      reason: balanceReason,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Użytkownicy
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Imię
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Rola
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Zamówienia
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users?.map((user: any) => (
              <>
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.firstName || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-600 ">
                        {parseFloat(user.balance).toFixed(2)} zł
                      </span>
                      <button
                        onClick={() => setEditBalanceUser(user)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-900 dark:text-white" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() =>
                        setExpandedUser(
                          expandedUser === user.id ? null : user.id
                        )
                      }
                      className="flex items-center gap-2 text-purple-600 hover:underline"
                    >
                      {user._count.orders} zamówień
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        if (confirm(`Usunąć użytkownika ${user.email}?`)) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                {/* Expanded Orders */}
                <AnimatePresence>
                  {expandedUser === user.id && userDetails && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td
                        colSpan={6}
                        className="px-6 py-4 bg-gray-50 dark:bg-gray-900"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold mb-3">Zamówienia:</h4>
                          {userDetails.orders?.length > 0 ? (
                            userDetails.orders.map((order: any) => (
                              <div
                                key={order.id}
                                className="p-3 bg-white dark:bg-gray-800 rounded border"
                              >
                                <div className="flex justify-between">
                                  <span className="font-semibold">
                                    {order.orderNumber}
                                  </span>
                                  <span className="text-purple-600">
                                    {parseFloat(order.totalPrice).toFixed(2)} zł
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {order.texts.length} tekstów • {order.status}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">Brak zamówień</p>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Balance Modal */}
      {editBalanceUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setEditBalanceUser(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edytuj saldo
            </h3>
            <p className="text-sm text-gray-900 dark:text-white mb-4">
              {editBalanceUser.email} • Aktualne saldo:{" "}
              {parseFloat(editBalanceUser.balance).toFixed(2)} zł
            </p>

            <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
              Kwota zmiany:
            </label>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(parseFloat(e.target.value))}
              className="input w-full mb-4"
              placeholder="np. 100 lub -50"
            />

            <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
              Powód:
            </label>
            <input
              type="text"
              value={balanceReason}
              onChange={(e) => setBalanceReason(e.target.value)}
              className="input w-full mb-4"
              placeholder="np. Korekta salda"
            />

            <div className="flex gap-3">
              <button
                onClick={handleBalanceSubmit}
                disabled={balanceMutation.isPending}
                className="btn btn-primary flex-1"
              >
                Zapisz
              </button>
              <button
                onClick={() => setEditBalanceUser(null)}
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
