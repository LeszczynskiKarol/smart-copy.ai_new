// frontend/src/pages/PrivacyPage.tsx
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Globe, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PrivacyPage = () => {
  const [language, setLanguage] = useState<"pl" | "en">("pl");

  return (
    <>
      <Helmet>
        <title>
          {language === "pl"
            ? "Polityka Prywatności - Smart-Copy.ai"
            : "Privacy Policy - Smart-Copy.ai"}
        </title>
        <meta
          name="description"
          content={
            language === "pl"
              ? "Polityka Prywatności Smart-Copy.ai - ochrona danych osobowych zgodnie z RODO"
              : "Smart-Copy.ai Privacy Policy - personal data protection in compliance with GDPR"
          }
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
          <div className="container-custom max-w-4xl">
            {/* Header with Language Switcher */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <Shield className="w-10 h-10 text-purple-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  {language === "pl"
                    ? "Polityka Prywatności"
                    : "Privacy Policy"}
                </h1>
              </motion.div>

              {/* Language Toggle */}
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <button
                  onClick={() => setLanguage("pl")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    language === "pl"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Polski
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    language === "en"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={language}
                initial={{ opacity: 0, x: language === "pl" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: language === "pl" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="card bg-white dark:bg-gray-800 prose prose-lg dark:prose-invert max-w-none"
              >
                {language === "pl" ? <PolishPrivacy /> : <EnglishPrivacy />}
              </motion.div>
            </AnimatePresence>

            {/* Last Updated */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
              {language === "pl"
                ? "Ostatnia aktualizacja: 29 października 2025"
                : "Last updated: October 29, 2025"}
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🇵🇱 POLSKA WERSJA POLITYKI PRYWATNOŚCI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PolishPrivacy = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 1. Postanowienia ogólne
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Administratorem danych osobowych Użytkowników serwisu Smart-Copy.ai
          (dalej: <strong>"Serwis"</strong>) dostępnego pod adresem{" "}
          <strong>https://smart-copy.ai</strong> jest{" "}
          <strong>eCopywriting.pl Karol Leszczyński</strong>, Papowo Biskupie
          119/18, Polska, NIP: 9562203948, REGON: 340627879 (dalej:{" "}
          <strong>"Administrator"</strong>).
        </li>
        <li>
          Kontakt z Administratorem w sprawach ochrony danych osobowych możliwy
          jest pod adresem email: <strong>contact@smart-copy.ai</strong>
        </li>
        <li>
          Niniejsza Polityka Prywatności określa zasady przetwarzania danych
          osobowych Użytkowników Serwisu zgodnie z Rozporządzeniem Parlamentu
          Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w
          sprawie ochrony osób fizycznych w związku z przetwarzaniem danych
          osobowych i w sprawie swobodnego przepływu takich danych (RODO).
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 2. Zakres zbieranych danych osobowych
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.1. Dane rejestracyjne
      </h3>
      <p className="mb-3">
        W zależności od wybranej metody rejestracji, Administrator przetwarza:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Rejestracja przez formularz:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Adres email (obowiązkowy)</li>
            <li>Hasło (w formie zaszyfrowanej)</li>
            <li>Imię (opcjonalne)</li>
            <li>Data utworzenia konta</li>
          </ul>
        </li>
        <li>
          <strong>Rejestracja przez Google (OAuth 2.0):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Adres email z konta Google</li>
            <li>Imię i nazwisko (z profilu Google)</li>
            <li>Identyfikator Google User ID</li>
            <li>Zdjęcie profilowe (jeśli udostępnione)</li>
          </ul>
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.2. Dane dotyczące korzystania z Serwisu
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Historia zamówień (tematy, długość, język tekstów)</li>
        <li>Wygenerowane treści</li>
        <li>Przesłane przez Użytkownika pliki źródłowe (PDF, DOC, DOCX)</li>
        <li>Linki URL wskazane jako źródła</li>
        <li>Wytyczne i preferencje dotyczące generowanych treści</li>
        <li>Frazy SEO i linki do umieszczenia w tekstach</li>
        <li>Historia transakcji i doładowań konta</li>
        <li>Saldo Środków na koncie</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.3. Dane płatności
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Przetwarzane przez Stripe Inc.:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Dane karty płatniczej (przechowywane przez Stripe)</li>
            <li>Kwota transakcji</li>
            <li>Data i czas transakcji</li>
            <li>Status płatności</li>
          </ul>
        </li>
        <li>
          Administrator nie ma dostępu do pełnych danych karty płatniczej - dane
          te są przetwarzane wyłącznie przez Stripe zgodnie z ich polityką
          prywatności.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.4. Dane techniczne
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Adres IP</li>
        <li>Typ przeglądarki i wersja</li>
        <li>System operacyjny</li>
        <li>Data i czas wizyty</li>
        <li>Odwiedzone podstrony</li>
        <li>Źródło wejścia (np. wyszukiwarka, link bezpośredni)</li>
        <li>Lokalizacja geograficzna (przybliżona, na podstawie IP)</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 3. Cele i podstawy prawne przetwarzania danych
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 mt-4">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Cel przetwarzania
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Podstawa prawna
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Dane
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Tworzenie i zarządzanie kontem użytkownika
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. b RODO (wykonanie umowy)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email, hasło, imię
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Realizacja zamówień generowania treści
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. b RODO (wykonanie umowy)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Wszystkie dane dotyczące zamówień
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Obsługa płatności
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. b RODO (wykonanie umowy)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Dane płatności
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Wysyłka powiadomień email o statusie zamówienia
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. b RODO (wykonanie umowy)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Rozpatrywanie reklamacji
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. c RODO (obowiązek prawny)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Dane kontaktowe, historia zamówień
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Marketing bezpośredni własnych usług
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Analiza statystyk i zachowań użytkowników
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Dane techniczne
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Zapewnienie bezpieczeństwa i wykrywanie nadużyć
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                IP, dane techniczne
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Archiwizacja dla celów księgowych i podatkowych
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6 ust. 1 lit. c RODO (obowiązek prawny)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Dane transakcji
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 4. Odbiorcy danych osobowych
      </h2>
      <p className="mb-4">
        W związku ze świadczeniem usług, Administrator może przekazywać dane
        osobowe następującym kategoriom odbiorców:
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        4.1. Podmioty przetwarzające
      </h3>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Stripe Inc.</strong> (USA) – obsługa płatności kartą, BLIK,
          Przelewy24. Stripe posiada certyfikat PCI DSS Level 1. Dane
          przekazywane na podstawie Standardowych Klauzul Umownych UE.
        </li>
        <li>
          <strong>Anthropic PBC</strong> (USA) – dostawca modelu AI Claude
          wykorzystywanego do generowania treści. Przetwarzane są wyłącznie dane
          niezbędne do generowania tekstu (temat, wytyczne, źródła). Anthropic
          nie przechowuje długoterminowo zapytań użytkowników.
        </li>
        <li>
          <strong>Amazon Web Services (AWS)</strong> (USA/Europa) – hosting
          aplikacji, przechowywanie plików użytkownika (S3), wysyłka emaili
          (SES). Dane przechowywane w regionie EU (eu-north-1 Stockholm).
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA) – hosting frontendu aplikacji. Dane
          przekazywane na podstawie Standardowych Klauzul Umownych UE.
        </li>
        <li>
          <strong>Google LLC</strong> (USA) – uwierzytelnianie OAuth 2.0 (w
          przypadku logowania przez Google), Google Analytics. Dane przekazywane
          na podstawie Standardowych Klauzul Umownych UE.
        </li>
        <li>
          <strong>Cloudflare Inc.</strong> (USA) – CDN, ochrona przed atakami
          DDoS, optymalizacja wydajności.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        4.2. Inne podmioty
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Dostawcy usług księgowych i prawnych (w zakresie niezbędnym do
          prawidłowego prowadzenia działalności)
        </li>
        <li>
          Organy publiczne i instytucje państwowe – wyłącznie w przypadku
          obowiązku prawnego
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 5. Okres przechowywania danych
      </h2>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Dane konta:</strong> Do czasu usunięcia konta przez
          Użytkownika lub dezaktywacji przez Administratora w przypadku
          naruszenia Regulaminu.
        </li>
        <li>
          <strong>Historia zamówień:</strong> Przez okres przedawnienia roszczeń
          wynikających z umowy (6 lat od końca roku, w którym wykonano
          świadczenie).
        </li>
        <li>
          <strong>Dane księgowe i transakcji:</strong> 5 lat od końca roku
          podatkowego, w którym powstał obowiązek podatkowy (zgodnie z Ordynacją
          podatkową).
        </li>
        <li>
          <strong>Pliki źródłowe przesłane przez Użytkownika:</strong> Do czasu
          usunięcia przez Użytkownika lub przez okres niezbędny do realizacji
          zamówienia + 30 dni (backup).
        </li>
        <li>
          <strong>Dane do marketingu bezpośredniego:</strong> Do czasu wycofania
          zgody lub zgłoszenia sprzeciwu.
        </li>
        <li>
          <strong>Logi systemowe:</strong> Do 12 miesięcy (w celach
          bezpieczeństwa i diagnostycznych).
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 6. Prawa osób, których dane dotyczą
      </h2>
      <p className="mb-4">Zgodnie z RODO, Użytkownik ma prawo do:</p>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          <strong>Dostępu do danych</strong> – pobrania kopii przetwarzanych
          danych osobowych (Art. 15 RODO)
        </li>
        <li>
          <strong>Sprostowania danych</strong> – poprawy nieprawidłowych lub
          uzupełnienia niekompletnych danych (Art. 16 RODO)
        </li>
        <li>
          <strong>Usunięcia danych</strong> („prawo do bycia zapomnianym") – w
          przypadkach przewidzianych w Art. 17 RODO, np. po wycofaniu zgody
          (Art. 17 RODO)
        </li>
        <li>
          <strong>Ograniczenia przetwarzania</strong> – w przypadkach
          przewidzianych w Art. 18 RODO, np. gdy użytkownik kwestionuje
          prawidłowość danych
        </li>
        <li>
          <strong>Przenoszenia danych</strong> – otrzymania danych w
          ustrukturyzowanym formacie (CSV/JSON) i przeniesienia ich do innego
          administratora (Art. 20 RODO)
        </li>
        <li>
          <strong>Sprzeciwu wobec przetwarzania</strong> – w szczególności wobec
          przetwarzania w celach marketingowych (Art. 21 RODO)
        </li>
        <li>
          <strong>Wniesienia skargi</strong> do organu nadzorczego (Prezes
          Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa)
        </li>
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 mt-6">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Jak skorzystać z praw?</strong>
          <br />
          Aby skorzystać z powyższych praw, wyślij wiadomość email na adres:{" "}
          <strong>contact@smart-copy.ai</strong> z tematem: „Dane osobowe –
          RODO". Administrator odpowie w ciągu 30 dni.
        </p>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 7. Bezpieczeństwo danych
      </h2>
      <p className="mb-4">
        Administrator stosuje następujące środki techniczne i organizacyjne w
        celu ochrony danych osobowych:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Szyfrowanie:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Połączenie HTTPS (TLS 1.3) na całej stronie</li>
            <li>Hasła przechowywane w formie zahashowanej (bcrypt)</li>
            <li>Tokeny JWT do autoryzacji</li>
          </ul>
        </li>
        <li>
          <strong>Kontrola dostępu:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Uwierzytelnianie dwuskładnikowe (2FA) dostępne dla użytkowników
            </li>
            <li>Logowanie administratorów z ograniczeniem IP</li>
            <li>Automatyczne wylogowanie po okresie nieaktywności</li>
          </ul>
        </li>
        <li>
          <strong>Monitoring i logi:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Monitorowanie prób nieautoryzowanego dostępu</li>
            <li>Logi dostępu do danych osobowych</li>
            <li>Regularne audyty bezpieczeństwa</li>
          </ul>
        </li>
        <li>
          <strong>Backup:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Automatyczne kopie zapasowe bazy danych (co 24h)</li>
            <li>Szyfrowane przechowywanie backupów</li>
            <li>Plan odzyskiwania po awarii (Disaster Recovery)</li>
          </ul>
        </li>
        <li>
          <strong>Ochrona przed atakami:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Firewall aplikacyjny (WAF)</li>
            <li>Ochrona przed DDoS (Cloudflare)</li>
            <li>Rate limiting na API</li>
            <li>Walidacja i sanityzacja danych wejściowych</li>
          </ul>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 8. Pliki Cookies
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.1. Czym są pliki cookies?
      </h3>
      <p className="mb-4">
        Pliki cookies to małe pliki tekstowe zapisywane na urządzeniu
        Użytkownika podczas korzystania z Serwisu. Cookies umożliwiają
        rozpoznanie urządzenia i dostosowanie parametrów witryny.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.2. Rodzaje wykorzystywanych cookies
      </h3>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Cookies niezbędne (sesyjne):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Utrzymanie sesji zalogowanego użytkownika</li>
            <li>Przechowywanie tokenu autoryzacyjnego</li>
            <li>Zabezpieczenie przed CSRF</li>
            <li>
              <em>Podstawa prawna:</em> Art. 6 ust. 1 lit. b RODO (wykonanie
              umowy)
            </li>
          </ul>
        </li>
        <li>
          <strong>Cookies preferencji:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Zapamiętanie preferencji językowych</li>
            <li>Zapamiętanie trybu ciemnego/jasnego</li>
            <li>
              <em>Podstawa prawna:</em> Zgoda użytkownika (Art. 6 ust. 1 lit. a
              RODO)
            </li>
          </ul>
        </li>
        <li>
          <strong>Cookies analityczne (Google Analytics):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Analiza ruchu na stronie</li>
            <li>Statystyki odwiedzin</li>
            <li>Analiza zachowań użytkowników</li>
            <li>
              <em>Podstawa prawna:</em> Zgoda użytkownika (Art. 6 ust. 1 lit. a
              RODO)
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.3. Zarządzanie cookies
      </h3>
      <p className="mb-4">
        Użytkownik może w każdej chwili zmienić ustawienia cookies w
        przeglądarce lub skorzystać z panelu zgód cookies dostępnego w Serwisie.
        Wyłączenie cookies niezbędnych może uniemożliwić korzystanie z pełnej
        funkcjonalności Serwisu.
      </p>
      <p>
        Szczegółowe informacje o zarządzaniu cookies dostępne są w{" "}
        <a
          href="/cookies"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Polityce Cookies
        </a>
        .
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 9. Zewnętrzne usługi analityczne
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        9.1. Google Analytics
      </h3>
      <p className="mb-3">
        Serwis wykorzystuje Google Analytics do analizy ruchu i zachowań
        użytkowników. Google Analytics przetwarza:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Adres IP (anonimizowany)</li>
        <li>Dane o urządzeniu i przeglądarce</li>
        <li>Strony odwiedzone i czas spędzony</li>
        <li>Źródło wejścia na stronę</li>
      </ul>
      <p className="mt-3">
        Więcej informacji:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Polityka Prywatności Google
        </a>
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        9.2. Google reCAPTCHA
      </h3>
      <p className="mb-3">
        W celu ochrony przed spamem i botami, Serwis wykorzystuje Google
        reCAPTCHA. reCAPTCHA analizuje interakcje użytkownika ze stroną i
        przetwarza dane takie jak: adres IP, ruchy myszy, czas spędzony na
        stronie.
      </p>
      <p>
        Więcej informacji:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Polityka Prywatności Google
        </a>
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 10. Przekazywanie danych poza EOG
      </h2>
      <p className="mb-4">
        W związku z korzystaniem z usług dostawców mających siedzibę w USA
        (Stripe, AWS, Anthropic, Google, Vercel, Cloudflare), dane osobowe mogą
        być przekazywane poza Europejski Obszar Gospodarczy (EOG).
      </p>
      <p className="mb-4">
        Zabezpieczenia stosowane przy przekazywaniu danych:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Standardowe Klauzule Umowne (SCC)</strong> zatwierdzone przez
          Komisję Europejską
        </li>
        <li>
          <strong>Data Privacy Framework (DPF)</strong> – certyfikat
          potwierdzający zgodność z europejskimi standardami ochrony danych
        </li>
        <li>
          <strong>Dodatkowe środki zabezpieczające:</strong> szyfrowanie
          end-to-end, kontrola dostępu, audyty bezpieczeństwa
        </li>
      </ul>
      <p className="mt-4">
        Lista podmiotów z USA, którym przekazywane są dane, oraz zastosowane
        zabezpieczenia znajdują się w § 4 niniejszej Polityki.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 11. Zautomatyzowane podejmowanie decyzji i profilowanie
      </h2>
      <p className="mb-4">
        Administrator <strong>nie stosuje</strong> zautomatyzowanego
        podejmowania decyzji, w tym profilowania, które wywołują wobec
        Użytkowników skutki prawne lub w podobny sposób istotnie wpływają na ich
        sytuację (zgodnie z Art. 22 RODO).
      </p>
      <p>
        Wygenerowane treści są tworzone przez AI na podstawie wytycznych
        Użytkownika, ale ostateczna decyzja o ich wykorzystaniu należy zawsze do
        Użytkownika.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 12. Dane dzieci
      </h2>
      <p className="mb-4">
        Serwis nie jest przeznaczony dla osób poniżej 18. roku życia.
        Administrator nie zbiera świadomie danych osobowych osób poniżej 18.
        roku życia.
      </p>
      <p>
        W przypadku stwierdzenia, że dane zostały zebrane od osoby poniżej 18.
        roku życia bez zgody rodziców/opiekunów prawnych, Administrator
        niezwłocznie usunie te dane.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 13. Zmiany w Polityce Prywatności
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej
          Polityce Prywatności.
        </li>
        <li>
          O istotnych zmianach Użytkownicy zostaną poinformowani z wyprzedzeniem
          minimum 14 dni poprzez:
          <ul className="list-disc pl-6 mt-2">
            <li>Komunikat po zalogowaniu do Serwisu</li>
            <li>Email na adres przypisany do konta</li>
          </ul>
        </li>
        <li>
          Data ostatniej aktualizacji Polityki Prywatności znajduje się na dole
          dokumentu.
        </li>
        <li>
          Kontynuowanie korzystania z Serwisu po wprowadzeniu zmian oznacza ich
          akceptację.
        </li>
      </ol>
    </section>

    <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📞 Kontakt w sprawach ochrony danych osobowych
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Administrator:</strong> eCopywriting.pl Karol Leszczyński
        <br />
        <strong>Adres:</strong> Papowo Biskupie 119/18, Polska
        <br />
        <strong>Email:</strong> contact@smart-copy.ai
        <br />
        <strong>NIP:</strong> 9562203948
        <br />
        <strong>REGON:</strong> 340627879
      </p>
    </section>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🇬🇧 ENGLISH VERSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EnglishPrivacy = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 1. General Provisions
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          The data controller for personal data of users of Smart-Copy.ai
          service (hereinafter: <strong>"Service"</strong>) available at{" "}
          <strong>https://smart-copy.ai</strong> is{" "}
          <strong>eCopywriting.pl Karol Leszczyński</strong>, Papowo Biskupie
          119/18, Poland, Tax ID: 9562203948, Business ID: 340627879
          (hereinafter: <strong>"Controller"</strong>).
        </li>
        <li>
          Contact with the Controller regarding personal data protection is
          possible at email address: <strong>contact@smart-copy.ai</strong>
        </li>
        <li>
          This Privacy Policy defines the rules for processing personal data of
          Service Users in accordance with Regulation (EU) 2016/679 of the
          European Parliament and of the Council of 27 April 2016 on the
          protection of natural persons with regard to the processing of
          personal data and on the free movement of such data (GDPR).
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 2. Scope of Collected Personal Data
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.1. Registration Data
      </h3>
      <p className="mb-3">
        Depending on the chosen registration method, the Controller processes:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Form Registration:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Email address (required)</li>
            <li>Password (in encrypted form)</li>
            <li>First name (optional)</li>
            <li>Account creation date</li>
          </ul>
        </li>
        <li>
          <strong>Google Registration (OAuth 2.0):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Email address from Google account</li>
            <li>First and last name (from Google profile)</li>
            <li>Google User ID</li>
            <li>Profile picture (if shared)</li>
          </ul>
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.2. Service Usage Data
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Order history (topics, length, language of texts)</li>
        <li>Generated content</li>
        <li>Source files uploaded by User (PDF, DOC, DOCX)</li>
        <li>URL links provided as sources</li>
        <li>Guidelines and preferences for generated content</li>
        <li>SEO keywords and links to include in texts</li>
        <li>Transaction and top-up history</li>
        <li>Credits balance</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.3. Payment Data
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Processed by Stripe Inc.:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Payment card data (stored by Stripe)</li>
            <li>Transaction amount</li>
            <li>Transaction date and time</li>
            <li>Payment status</li>
          </ul>
        </li>
        <li>
          The Controller does not have access to full payment card data - this
          data is processed exclusively by Stripe in accordance with their
          privacy policy.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        2.4. Technical Data
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Visit date and time</li>
        <li>Visited pages</li>
        <li>Entry source (e.g., search engine, direct link)</li>
        <li>Geographic location (approximate, based on IP)</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 3. Purposes and Legal Basis for Data Processing
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 mt-4">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Processing Purpose
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Legal Basis
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Creating and managing user account
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(b) GDPR (contract performance)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email, password, name
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Fulfilling content generation orders
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(b) GDPR (contract performance)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                All order-related data
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Payment processing
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(b) GDPR (contract performance)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Payment data
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Sending email notifications about order status
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(b) GDPR (contract performance)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Handling complaints
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(c) GDPR (legal obligation)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Contact data, order history
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Direct marketing of own services
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(f) GDPR (legitimate interest)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Email
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Statistics and user behavior analysis
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(f) GDPR (legitimate interest)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Technical data
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Ensuring security and detecting abuse
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(f) GDPR (legitimate interest)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                IP, technical data
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Archiving for accounting and tax purposes
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Art. 6(1)(c) GDPR (legal obligation)
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                Transaction data
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 4. Personal Data Recipients
      </h2>
      <p className="mb-4">
        In connection with providing services, the Controller may transfer
        personal data to the following categories of recipients:
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        4.1. Data Processors
      </h3>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Stripe Inc.</strong> (USA) – payment processing (card, BLIK,
          Przelewy24). Stripe holds PCI DSS Level 1 certification. Data
          transferred based on EU Standard Contractual Clauses.
        </li>
        <li>
          <strong>Anthropic PBC</strong> (USA) – provider of Claude AI model
          used for content generation. Only data necessary for text generation
          is processed (topic, guidelines, sources). Anthropic does not store
          user queries long-term.
        </li>
        <li>
          <strong>Amazon Web Services (AWS)</strong> (USA/Europe) – application
          hosting, user file storage (S3), email sending (SES). Data stored in
          EU region (eu-north-1 Stockholm).
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA) – frontend application hosting.
          Data transferred based on EU Standard Contractual Clauses.
        </li>
        <li>
          <strong>Google LLC</strong> (USA) – OAuth 2.0 authentication (for
          Google sign-in), Google Analytics. Data transferred based on EU
          Standard Contractual Clauses.
        </li>
        <li>
          <strong>Cloudflare Inc.</strong> (USA) – CDN, DDoS protection,
          performance optimization.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        4.2. Other Entities
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Accounting and legal service providers (to the extent necessary for
          proper business operations)
        </li>
        <li>
          Public authorities and state institutions – only in case of legal
          obligation
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 5. Data Retention Period
      </h2>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Account data:</strong> Until account deletion by User or
          deactivation by Controller in case of Terms violation.
        </li>
        <li>
          <strong>Order history:</strong> For the limitation period of claims
          arising from the contract (6 years from the end of the year in which
          the service was performed).
        </li>
        <li>
          <strong>Accounting and transaction data:</strong> 5 years from the end
          of the tax year in which the tax obligation arose (in accordance with
          Tax Ordinance).
        </li>
        <li>
          <strong>Source files uploaded by User:</strong> Until deleted by User
          or for the period necessary to fulfill the order + 30 days (backup).
        </li>
        <li>
          <strong>Direct marketing data:</strong> Until consent withdrawal or
          objection.
        </li>
        <li>
          <strong>System logs:</strong> Up to 12 months (for security and
          diagnostic purposes).
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 6. Data Subject Rights
      </h2>
      <p className="mb-4">
        In accordance with GDPR, the User has the right to:
      </p>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          <strong>Access to data</strong> – download a copy of processed
          personal data (Art. 15 GDPR)
        </li>
        <li>
          <strong>Rectification of data</strong> – correction of incorrect or
          completion of incomplete data (Art. 16 GDPR)
        </li>
        <li>
          <strong>Erasure of data</strong> ("right to be forgotten") – in cases
          provided in Art. 17 GDPR, e.g., after consent withdrawal (Art. 17
          GDPR)
        </li>
        <li>
          <strong>Restriction of processing</strong> – in cases provided in Art.
          18 GDPR, e.g., when user contests data accuracy
        </li>
        <li>
          <strong>Data portability</strong> – receiving data in structured
          format (CSV/JSON) and transferring it to another controller (Art. 20
          GDPR)
        </li>
        <li>
          <strong>Object to processing</strong> – particularly to processing for
          marketing purposes (Art. 21 GDPR)
        </li>
        <li>
          <strong>Lodge a complaint</strong> with supervisory authority
          (President of the Personal Data Protection Office, ul. Stawki 2,
          00-193 Warsaw, Poland)
        </li>
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 mt-6">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>How to exercise your rights?</strong>
          <br />
          To exercise the above rights, send an email to:{" "}
          <strong>contact@smart-copy.ai</strong> with the subject: "Personal
          Data – GDPR". The Controller will respond within 30 days.
        </p>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 7. Data Security
      </h2>
      <p className="mb-4">
        The Controller applies the following technical and organizational
        measures to protect personal data:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Encryption:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>HTTPS connection (TLS 1.3) across entire site</li>
            <li>Passwords stored in hashed form (bcrypt)</li>
            <li>JWT tokens for authorization</li>
          </ul>
        </li>
        <li>
          <strong>Access control:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Two-factor authentication (2FA) available for users</li>
            <li>Administrator login with IP restrictions</li>
            <li>Automatic logout after inactivity period</li>
          </ul>
        </li>
        <li>
          <strong>Monitoring and logs:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Monitoring unauthorized access attempts</li>
            <li>Personal data access logs</li>
            <li>Regular security audits</li>
          </ul>
        </li>
        <li>
          <strong>Backup:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Automatic database backups (every 24h)</li>
            <li>Encrypted backup storage</li>
            <li>Disaster Recovery plan</li>
          </ul>
        </li>
        <li>
          <strong>Attack protection:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Web Application Firewall (WAF)</li>
            <li>DDoS protection (Cloudflare)</li>
            <li>API rate limiting</li>
            <li>Input validation and sanitization</li>
          </ul>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 8. Cookies
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.1. What are cookies?
      </h3>
      <p className="mb-4">
        Cookies are small text files saved on the User's device while using the
        Service. Cookies enable device recognition and adjustment of site
        parameters.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.2. Types of cookies used
      </h3>
      <ul className="list-disc pl-6 space-y-3">
        <li>
          <strong>Essential cookies (session):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Maintaining logged-in user session</li>
            <li>Storing authorization token</li>
            <li>CSRF protection</li>
            <li>
              <em>Legal basis:</em> Art. 6(1)(b) GDPR (contract performance)
            </li>
          </ul>
        </li>
        <li>
          <strong>Preference cookies:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Remembering language preferences</li>
            <li>Remembering dark/light mode</li>
            <li>
              <em>Legal basis:</em> User consent (Art. 6(1)(a) GDPR)
            </li>
          </ul>
        </li>
        <li>
          <strong>Analytics cookies (Google Analytics):</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Site traffic analysis</li>
            <li>Visit statistics</li>
            <li>User behavior analysis</li>
            <li>
              <em>Legal basis:</em> User consent (Art. 6(1)(a) GDPR)
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        8.3. Cookie management
      </h3>
      <p className="mb-4">
        User can change cookie settings in browser at any time or use the cookie
        consent panel available in the Service. Disabling essential cookies may
        prevent full functionality of the Service.
      </p>
      <p>
        Detailed information about cookie management is available in{" "}
        <a
          href="/cookies"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Cookie Policy
        </a>
        .
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 9. External Analytics Services
      </h2>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        9.1. Google Analytics
      </h3>
      <p className="mb-3">
        The Service uses Google Analytics to analyze traffic and user behavior.
        Google Analytics processes:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>IP address (anonymized)</li>
        <li>Device and browser data</li>
        <li>Pages visited and time spent</li>
        <li>Entry source to site</li>
      </ul>
      <p className="mt-3">
        More information:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Google Privacy Policy
        </a>
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        9.2. Google reCAPTCHA
      </h3>
      <p className="mb-3">
        To protect against spam and bots, the Service uses Google reCAPTCHA.
        reCAPTCHA analyzes user interactions with the site and processes data
        such as: IP address, mouse movements, time spent on site.
      </p>
      <p>
        More information:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Google Privacy Policy
        </a>
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 10. Data Transfer Outside EEA
      </h2>
      <p className="mb-4">
        Due to the use of services from providers based in the USA (Stripe, AWS,
        Anthropic, Google, Vercel, Cloudflare), personal data may be transferred
        outside the European Economic Area (EEA).
      </p>
      <p className="mb-4">Safeguards applied when transferring data:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Standard Contractual Clauses (SCC)</strong> approved by the
          European Commission
        </li>
        <li>
          <strong>Data Privacy Framework (DPF)</strong> – certificate confirming
          compliance with European data protection standards
        </li>
        <li>
          <strong>Additional safeguards:</strong> end-to-end encryption, access
          control, security audits
        </li>
      </ul>
      <p className="mt-4">
        List of USA-based entities to whom data is transferred and applied
        safeguards can be found in § 4 of this Policy.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 11. Automated Decision-Making and Profiling
      </h2>
      <p className="mb-4">
        The Controller <strong>does not use</strong> automated decision-making,
        including profiling, that produces legal effects concerning Users or
        similarly significantly affects them (according to Art. 22 GDPR).
      </p>
      <p>
        Generated content is created by AI based on User guidelines, but the
        final decision on its use always belongs to the User.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 12. Children's Data
      </h2>
      <p className="mb-4">
        The Service is not intended for persons under 18 years of age. The
        Controller does not knowingly collect personal data from persons under
        18 years of age.
      </p>
      <p>
        If it is determined that data has been collected from a person under 18
        years of age without parental/legal guardian consent, the Controller
        will immediately delete such data.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 13. Changes to Privacy Policy
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          The Controller reserves the right to make changes to this Privacy
          Policy.
        </li>
        <li>
          Users will be notified of significant changes at least 14 days in
          advance through:
          <ul className="list-disc pl-6 mt-2">
            <li>Notification after logging into the Service</li>
            <li>Email to the account's email address</li>
          </ul>
        </li>
        <li>
          The date of the last Privacy Policy update is located at the bottom of
          the document.
        </li>
        <li>
          Continued use of the Service after changes are introduced means their
          acceptance.
        </li>
      </ol>
    </section>

    <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📞 Contact for Personal Data Protection Matters
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Controller:</strong> eCopywriting.pl Karol Leszczyński
        <br />
        <strong>Address:</strong> Papowo Biskupie 119/18, Poland
        <br />
        <strong>Email:</strong> contact@smart-copy.ai
        <br />
        <strong>Tax ID:</strong> 9562203948
        <br />
        <strong>Business ID:</strong> 340627879
      </p>
    </section>
  </div>
);
