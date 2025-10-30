// frontend/src/components/layout/UserSidebar.tsx

import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  Plus,
  Wallet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const UserSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Pobierz saldo użytkownika
  const { data: userData } = useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/me");
      return res.data;
    },
    refetchInterval: 30000, // Odświeżaj co 30s
  });

  const balance = userData?.balance ? parseFloat(userData.balance) : 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Zamów tekst", href: "/orders?mode=new", icon: Plus },
    { name: "Twoje zamówienia", href: "/orders", icon: Package },
  ];

  const isActive = (path: string) => {
    const pathname = location.pathname;

    // Specjalne przypadki dla /orders
    if (path === "/orders?mode=new") {
      return pathname === "/orders" && searchParams.get("mode") === "new";
    }

    if (path === "/orders") {
      // ✅ Podświetl dla /orders oraz /orders/{id}
      return (
        (pathname === "/orders" && searchParams.get("mode") !== "new") ||
        pathname.startsWith("/orders/")
      );
    }

    // Dla innych ścieżek
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:sticky top-0 left-0 h-screen w-64 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 overflow-y-auto"
          >
            <div className="p-4 flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between mb-8 pt-20 lg:pt-4">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Smart-Copy.ai
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:block hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-500" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Balance Card */}
              <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Saldo konta
                  </span>
                  <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                  {balance.toFixed(2)} zł
                </p>
                <Link
                  to="/deposit"
                  className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
                >
                  <Plus className="w-4 h-4" />
                  Doładuj konto
                </Link>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 mb-2"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-5 h-5" />
                    Tryb ciemny
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5" />
                    Tryb jasny
                  </>
                )}
              </button>

              {/* User Info & Logout */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 lg:pb-0">
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1 px-4 truncate">
                  {user?.firstName || "Użytkownik"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3 px-4">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj się
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Toggle Button (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:block fixed top-20 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-500" />
        </button>
      )}
    </>
  );
};
