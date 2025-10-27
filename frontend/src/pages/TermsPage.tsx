// frontend/src/pages/TermsPage.tsx

import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

export const TermsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container-custom max-w-4xl"
        >
          <div className="card">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Regulamin serwisu
            </h1>
            <p className="text-gray-600 mb-8">
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </p>

            <div className="prose prose-lg max-w-none">
              <h2>1. Postanowienia ogólne</h2>
              <p>
                Niniejszy regulamin określa zasady korzystania z serwisu
                Smart-Copy.ai oraz prawa i obowiązki użytkowników.
              </p>

              <h2>2. Definicje</h2>
              <ul>
                <li>
                  <strong>Serwis</strong> - platforma Smart-Copy.ai dostępna pod
                  adresem smart-copy.ai
                </li>
                <li>
                  <strong>Użytkownik</strong> - osoba fizyczna lub prawna
                  korzystająca z Serwisu
                </li>
                <li>
                  <strong>Konto</strong> - zbiór zasobów i ustawień przypisanych
                  do Użytkownika
                </li>
              </ul>

              <h2>3. Rejestracja i konto użytkownika</h2>
              <p>
                Aby korzystać z pełnej funkcjonalności Serwisu, Użytkownik musi
                utworzyć konto poprzez formularz rejestracyjny. Użytkownik
                zobowiązuje się do podania prawdziwych danych.
              </p>

              <h2>4. Odpowiedzialność</h2>
              <p>
                Serwis nie ponosi odpowiedzialności za treści generowane przez
                sztuczną inteligencję. Użytkownik ponosi pełną odpowiedzialność
                za sposób wykorzystania wygenerowanych treści.
              </p>

              <h2>5. Prawa autorskie</h2>
              <p>
                Treści wygenerowane przez Serwis mogą być wykorzystywane przez
                Użytkownika zgodnie z obowiązującymi przepisami prawa.
              </p>

              <h2>6. Postanowienia końcowe</h2>
              <p>
                Serwis zastrzega sobie prawo do wprowadzania zmian w
                Regulaminie. O wszelkich zmianach Użytkownicy zostaną
                poinformowani z odpowiednim wyprzedzeniem.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
