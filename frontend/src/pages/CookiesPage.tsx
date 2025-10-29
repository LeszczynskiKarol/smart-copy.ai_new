// frontend/src/pages/CookiesPage.tsx
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";

export const CookiesPage = () => {
  const { consent, setShowBanner, clearConsent } = useCookieConsent();

  return (
    <>
      <Helmet>
        <title>Polityka Cookies - Smart-Copy.AI</title>
        <meta
          name="description"
          content="Dowiedz się, jak wykorzystujemy pliki cookie na naszej stronie."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Layout>
        <div className="bg-white dark:bg-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Polityka Cookies
                </h1>
              </div>
              <p className="text-lg text-slate-600 dark:text-gray-300">
                Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
              </p>
            </div>

            {/* Aktualne ustawienia */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Twoje aktualne ustawienia
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-gray-300">
                    Niezbędne
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    Zawsze aktywne
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-gray-300">
                    Analityczne
                  </span>
                  <span
                    className={
                      consent.analytics
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {consent.analytics ? "Włączone" : "Wyłączone"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-gray-300">
                    Marketingowe
                  </span>
                  <span
                    className={
                      consent.marketing
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {consent.marketing ? "Włączone" : "Wyłączone"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(true)}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Zmień ustawienia cookies
              </button>
            </div>

            {/* Treść */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2>Czym są pliki cookie?</h2>
              <p>
                Pliki cookie to małe pliki tekstowe zapisywane na Twoim
                urządzeniu podczas przeglądania stron internetowych. Pomagają
                nam zapewnić lepsze doświadczenia użytkownika i analizować
                sposób korzystania z naszej strony.
              </p>

              <h2>Jakie pliki cookie używamy?</h2>

              <div className="not-prose space-y-6 my-8">
                {/* Niezbędne */}
                <div className="border border-slate-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Niezbędne pliki cookie
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                        Te pliki są wymagane do prawidłowego działania strony i
                        nie mogą być wyłączone.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-800 rounded p-4 text-sm">
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Cel:</strong> Uwierzytelnianie, bezpieczeństwo,
                      preferencje użytkownika
                    </p>
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Czas przechowywania:</strong> Sesja lub do 12
                      miesięcy
                    </p>
                    <p className="text-slate-700 dark:text-gray-300">
                      <strong>Przykłady:</strong> token uwierzytelniania, zgody
                      na cookies
                    </p>
                  </div>
                </div>

                {/* Analityczne */}
                <div className="border border-slate-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Analityczne pliki cookie
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                        Pomagają nam zrozumieć, jak użytkownicy korzystają z
                        naszej strony.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-800 rounded p-4 text-sm">
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Dostawca:</strong> Google Analytics (GA4)
                    </p>
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Cel:</strong> Statystyki odwiedzin, źródła ruchu,
                      zachowania użytkowników
                    </p>
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Czas przechowywania:</strong> Do 14 miesięcy
                    </p>
                    <p className="text-slate-700 dark:text-gray-300">
                      <strong>Cookies:</strong> _ga, _ga_*, _gid
                    </p>
                  </div>
                </div>

                {/* Marketingowe */}
                <div className="border border-slate-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Marketingowe pliki cookie
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                        Wykorzystywane do personalizacji reklam i remarketingu.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-800 rounded p-4 text-sm">
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Dostawcy:</strong> Google Ads, Facebook
                    </p>
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Cel:</strong> Targetowanie reklam, pomiar
                      konwersji
                    </p>
                    <p className="text-slate-700 dark:text-gray-300 mb-2">
                      <strong>Czas przechowywania:</strong> Do 90 dni
                    </p>
                    <p className="text-slate-700 dark:text-gray-300">
                      <strong>Cookies:</strong> _gcl_*, fr, _fbp
                    </p>
                  </div>
                </div>
              </div>

              <h2>Jak zarządzać plikami cookie?</h2>
              <p>
                Możesz w każdej chwili zmienić swoje preferencje dotyczące
                plików cookie, klikając przycisk "Zmień ustawienia cookies"
                powyżej. Pamiętaj, że wyłączenie niektórych kategorii cookies
                może wpłynąć na funkcjonalność strony.
              </p>

              <h2>Cookies stron trzecich</h2>
              <p>
                Niektóre pliki cookie pochodzą od dostawców zewnętrznych
                (Google, Facebook). Nie mamy kontroli nad tymi plikami cookie.
                Zalecamy zapoznanie się z politykami prywatności tych dostawców:
              </p>
              <ul>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener"
                  >
                    Polityka prywatności Google
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/privacy/explanation"
                    target="_blank"
                    rel="noopener"
                  >
                    Polityka prywatności Facebook
                  </a>
                </li>
              </ul>

              <h2>Kontakt</h2>
              <p>
                Jeśli masz pytania dotyczące naszej polityki cookies, skontaktuj
                się z nami pod adresem:{" "}
                <a href="mailto:privacy@smart-copy.ai">privacy@smart-copy.ai</a>
              </p>
            </div>

            {/* Wycofaj zgodę */}
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Wycofaj wszystkie zgody
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
                Możesz w każdej chwili wycofać wszystkie zgody na wykorzystanie
                plików cookie. Spowoduje to usunięcie wszystkich zapisanych
                preferencji i ponowne wyświetlenie bannera cookies.
              </p>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Czy na pewno chcesz wycofać wszystkie zgody na cookies?"
                    )
                  ) {
                    clearConsent();
                  }
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Wycofaj wszystkie zgody
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
