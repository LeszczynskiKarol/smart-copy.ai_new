// frontend/src/pages/PrivacyPage.tsx

import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

export const PrivacyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container-custom max-w-4xl"
        >
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Polityka prywatności
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>1. Informacje ogólne</h2>
              <p>
                Niniejsza Polityka prywatności określa zasady przetwarzania i
                ochrony danych osobowych przekazanych przez Użytkowników w
                związku z korzystaniem z Serwisu Smart-Copy.ai.
              </p>

              <h2>2. Administrator danych</h2>
              <p>
                Administratorem danych osobowych zbieranych za pośrednictwem
                Serwisu jest Smart-Copy.ai.
              </p>

              <h2>3. Rodzaj przetwarzanych danych</h2>
              <p>Przetwarzamy następujące dane osobowe:</p>
              <ul>
                <li>Adres e-mail</li>
                <li>Imię i nazwisko (opcjonalnie)</li>
                <li>Dane dotyczące korzystania z Serwisu</li>
                <li>Dane techniczne (adres IP, typ przeglądarki)</li>
              </ul>

              <h2>4. Cel przetwarzania danych</h2>
              <p>Dane osobowe są przetwarzane w celu:</p>
              <ul>
                <li>Rejestracji i obsługi konta użytkownika</li>
                <li>Świadczenia usług oferowanych przez Serwis</li>
                <li>Komunikacji z Użytkownikami</li>
                <li>Zapewnienia bezpieczeństwa Serwisu</li>
                <li>Analiz statystycznych i ulepszania Serwisu</li>
              </ul>

              <h2>5. Udostępnianie danych</h2>
              <p>
                Dane osobowe mogą być udostępniane zaufanym partnerom
                wspierającym działanie Serwisu, w tym dostawcom usług
                hostingowych i analitycznych.
              </p>

              <h2>6. Prawa użytkownika</h2>
              <p>Użytkownik ma prawo do:</p>
              <ul>
                <li>Dostępu do swoich danych osobowych</li>
                <li>Sprostowania danych</li>
                <li>Usunięcia danych</li>
                <li>Ograniczenia przetwarzania</li>
                <li>Przenoszenia danych</li>
                <li>Wniesienia sprzeciwu wobec przetwarzania</li>
              </ul>

              <h2>7. Pliki cookies</h2>
              <p>
                Serwis wykorzystuje pliki cookies w celu zapewnienia
                prawidłowego funkcjonowania, analizy ruchu oraz personalizacji
                treści.
              </p>

              <h2>8. Bezpieczeństwo danych</h2>
              <p>
                Stosujemy odpowiednie środki techniczne i organizacyjne
                zapewniające bezpieczeństwo przetwarzanych danych osobowych.
              </p>

              <h2>9. Kontakt</h2>
              <p>
                W sprawach dotyczących przetwarzania danych osobowych prosimy o
                kontakt: kontakt@smart-copy.ai
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
