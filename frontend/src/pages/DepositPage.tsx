// frontend/src/pages/DepositPage.tsx - ZAMIEŃ CAŁY:

import { useState } from "react";
import { UserSidebar } from "@/components/layout/UserSidebar";
import { Wallet, Plus, AlertCircle, Tag, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export const DepositPage = () => {
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [50, 100, 200, 500, 1000];

  // OBLICZ RABAT
  const getDiscount = (amt: number) => {
    if (amt >= 500) return 0.3; // 30%
    if (amt >= 200) return 0.2; // 20%
    if (amt >= 100) return 0.1; // 10%
    return 0;
  };

  const discount = getDiscount(amount);
  const discountAmount = amount * discount;
  const finalPrice = amount - discountAmount;
  const savingsAmount = discountAmount;

  const handleDeposit = async () => {
    if (amount < 5) {
      toast.error("Minimalna kwota to 5 PLN");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/orders/deposit", { amount });

      if (response.data.stripeUrl) {
        window.location.href = response.data.stripeUrl;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Błąd podczas doładowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <UserSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Doładuj konto
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Dodaj środki na swoje konto Smart-Copy.ai
              </p>
            </div>

            {/* RABATY INFO */}
            <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div className="flex items-start gap-3">
                <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    🎉 Aktywne rabaty na doładowania!
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        💰 100-199 zł →
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        10% rabatu
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        💎 200-499 zł →
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        20% rabatu
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        🚀 500+ zł →
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        30% rabatu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              {/* Preset Amounts */}
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                Wybierz kwotę lub wpisz własną
              </label>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all relative ${
                      amount === preset
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {preset} zł
                    {getDiscount(preset) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        -{(getDiscount(preset) * 100).toFixed(0)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                Własna kwota
              </label>
              <div className="relative mb-6">
                <input
                  type="number"
                  min="5"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="input w-full text-2xl font-bold text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                  zł
                </span>
              </div>

              {/* RABAT INFO */}
              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg mb-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-bold text-green-900 dark:text-green-300">
                      Gratulacje! Oszczędzasz {(discount * 100).toFixed(0)}%!
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Doładowanie konta:
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {amount.toFixed(2)} zł
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">
                        Rabat ({(discount * 100).toFixed(0)}%):
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        -{savingsAmount.toFixed(2)} zł
                      </span>
                    </div>
                    <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">
                        Do zapłaty:
                      </span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {finalPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <p className="font-semibold mb-1">Informacje:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Minimalna kwota doładowania: 5 PLN</li>
                    <li>Płatności obsługuje Stripe (karta, BLIK, P24)</li>
                    <li>Środki są dodawane natychmiast po płatności</li>
                    {discount > 0 && (
                      <li className="font-bold text-green-700 dark:text-green-400">
                        Płacisz {finalPrice.toFixed(2)} zł, dostajesz{" "}
                        {amount.toFixed(2)} zł!
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleDeposit}
                disabled={isLoading || amount < 5}
                className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  "Przekierowywanie..."
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {discount > 0
                      ? `Zapłać ${finalPrice.toFixed(
                          2
                        )} zł • Dostaniesz ${amount.toFixed(2)} zł`
                      : `Doładuj ${amount.toFixed(2)} zł`}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
