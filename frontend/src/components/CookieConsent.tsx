// frontend/src/components/CookieConsent.tsx
import { useState } from "react";
import {
  useCookieConsent,
  ConsentCategories,
} from "@/contexts/CookieConsentContext";

import { X, Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const { showBanner, consent, saveConsent, acceptAll, rejectAll } =
    useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [customConsent, setCustomConsent] =
    useState<ConsentCategories>(consent);

  if (!showBanner) return null;

  const handleSaveCustom = () => {
    saveConsent(customConsent);
  };

  return (
    <>
      {/* Overlay */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {!showSettings ? (
            // Główny banner
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    Używamy plików cookie
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    Ta strona używa plików cookie w celu poprawy komfortu
                    korzystania z witryny oraz analizy ruchu. Możesz zarządzać
                    swoimi preferencjami cookies w każdej chwili.{" "}
                    <Link
                      to="/privacy"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Dowiedz się więcej
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Ustawienia
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  Odrzuć wszystkie
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold text-sm shadow-lg"
                >
                  Akceptuj wszystkie
                </button>
              </div>
            </div>
          ) : (
            // Panel ustawień
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ustawienia prywatności
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Niezbędne */}
                <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          Niezbędne pliki cookie
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-gray-300">
                          Te pliki są wymagane do prawidłowego funkcjonowania
                          strony. Nie mogą być wyłączone.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        Zawsze aktywne
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analityczne */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          Analityczne pliki cookie
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
                          Pomagają nam zrozumieć, jak odwiedzający korzystają z
                          naszej strony (Google Analytics).
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Dostawcy: Google Analytics
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customConsent.analytics}
                        onChange={(e) =>
                          setCustomConsent({
                            ...customConsent,
                            analytics: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Marketingowe */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          Marketingowe pliki cookie
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
                          Wykorzystywane do targetowania reklam i remarketingu.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Dostawcy: Google Ads, Facebook Pixel
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customConsent.marketing}
                        onChange={(e) =>
                          setCustomConsent({
                            ...customConsent,
                            marketing: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomConsent({
                      necessary: true,
                      analytics: false,
                      marketing: false,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Odrzuć wszystkie
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold shadow-lg"
                >
                  Zapisz ustawienia
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
