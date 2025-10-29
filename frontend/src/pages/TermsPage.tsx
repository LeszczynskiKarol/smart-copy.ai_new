// frontend/src/pages/TermsPage.tsx
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TermsPage = () => {
  const [language, setLanguage] = useState<"pl" | "en">("pl");

  return (
    <>
      <Helmet>
        <title>
          {language === "pl"
            ? "Regulamin - Smart-Copy.ai"
            : "Terms of Service - Smart-Copy.ai"}
        </title>
        <meta
          name="description"
          content={
            language === "pl"
              ? "Regulamin świadczenia usług Smart-Copy.ai - generator tekstów AI"
              : "Terms of Service for Smart-Copy.ai - AI text generator"
          }
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
          <div className="container-custom max-w-4xl">
            {/* Header with Language Switcher */}
            <div className="flex items-center justify-between mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
              >
                {language === "pl" ? "Regulamin" : "Terms of Service"}
              </motion.h1>

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
                {language === "pl" ? <PolishTerms /> : <EnglishTerms />}
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
// 🇵🇱 POLSKA WERSJA REGULAMINU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PolishTerms = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 1. Postanowienia ogólne i definicje
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Niniejszy Regulamin określa zasady świadczenia usług drogą
          elektroniczną przez Smart-Copy.ai, dostępny pod adresem{" "}
          <strong>https://smart-copy.ai</strong> (zwany dalej{" "}
          <strong>"Serwisem"</strong>).
        </li>
        <li>
          Administratorem Serwisu oraz usługodawcą jest{" "}
          <strong>eCopywriting.pl Karol Leszczyński</strong>, z siedzibą w{" "}
          <strong>Papowie Biskupim 119/18</strong>, NIP:{" "}
          <strong>9562203948</strong>, REGON: <strong>340627879</strong> (zwany
          dalej <strong>"Usługodawcą"</strong>
          ).
        </li>
        <li>
          <strong>Definicje użyte w Regulaminie:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Użytkownik</strong> – osoba fizyczna, osoba prawna lub
              jednostka organizacyjna nieposiadająca osobowości prawnej,
              korzystająca z Serwisu.
            </li>
            <li>
              <strong>Konsument</strong> – Użytkownik będący osobą fizyczną
              dokonującą czynności prawnej niezwiązanej bezpośrednio z jego
              działalnością gospodarczą lub zawodową (definicja z art. 22¹
              Kodeksu cywilnego).
            </li>
            <li>
              <strong>Przedsiębiorca na prawach konsumenta</strong> – osoba
              fizyczna zawierająca umowę bezpośrednio związaną z jej
              działalnością gospodarczą, gdy z treści tej umowy wynika, że nie
              posiada ona dla niej charakteru zawodowego, wynikającego w
              szczególności z przedmiotu wykonywanej przez nią działalności
              gospodarczej, udostępnionego na podstawie przepisów o Centralnej
              Ewidencji i Informacji o Działalności Gospodarczej (definicja z
              art. 38a Kodeksu cywilnego).
            </li>
            <li>
              <strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie
              umożliwiające korzystanie z usług.
            </li>
            <li>
              <strong>Zamówienie</strong> – zlecenie wygenerowania treści
              cyfrowej (tekstu) przez Użytkownika.
            </li>
            <li>
              <strong>Treść cyfrowa</strong> – wygenerowany przez sztuczną
              inteligencję tekst w formatach HTML, PDF, DOCX dostarczany
              Użytkownikowi niedostarczany na nośniku materialnym.
            </li>
            <li>
              <strong>Środki</strong> – wirtualna waluta w Serwisie, nabywana
              przez Użytkownika w drodze doładowania konta, służąca do opłacania
              Zamówień (1 PLN = 1 Środek).
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 2. Rejestracja i konto użytkownika
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Korzystanie z usług Serwisu wymaga utworzenia Konta poprzez
          wypełnienie formularza rejestracyjnego.
        </li>
        <li>
          Rejestracja może nastąpić poprzez:
          <ul className="list-disc pl-6 mt-2">
            <li>Wypełnienie formularza rejestracyjnego (email + hasło)</li>
            <li>Logowanie przez konto Google (OAuth 2.0)</li>
          </ul>
        </li>
        <li>
          W przypadku rejestracji przez formularz, Użytkownik musi podać adres
          email oraz utworzyć hasło spełniające wymogi bezpieczeństwa (minimum 8
          znaków, wielka litera, mała litera, cyfra).
        </li>
        <li>
          Po rejestracji na podany adres email zostanie wysłany kod
          weryfikacyjny. Konto zostanie aktywowane po wprowadzeniu prawidłowego
          kodu.
        </li>
        <li>
          W przypadku rejestracji przez Google, Użytkownik wyraża zgodę na
          przekazanie przez Google podstawowych danych profilowych (imię, adres
          email).
        </li>
        <li>
          Użytkownik zobowiązany jest do podania prawdziwych danych oraz ich
          aktualizacji w przypadku zmiany.
        </li>
        <li>
          Użytkownik zobowiązany jest do zachowania poufności danych logowania.
          Usługodawca nie ponosi odpowiedzialności za nieautoryzowane
          korzystanie z Konta wynikające z nieprzestrzegania tego obowiązku.
        </li>
        <li>
          Zakazane jest udostępnianie Konta osobom trzecim oraz tworzenie więcej
          niż jednego Konta przez jednego Użytkownika bez zgody Usługodawcy.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 3. Usługi świadczone przez serwis
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Serwis świadczy usługi generowania treści cyfrowych (tekstów) przy
          użyciu sztucznej inteligencji (model Claude 4 Sonnet firmy Anthropic).
        </li>
        <li>
          Użytkownik składa Zamówienie określając:
          <ul className="list-disc pl-6 mt-2">
            <li>Temat tekstu</li>
            <li>Długość tekstu (w znakach/stronach)</li>
            <li>
              Język (polski, angielski, niemiecki, hiszpański, francuski,
              włoski, ukraiński, rosyjski)
            </li>
            <li>Rodzaj tekstu (artykuł, raport, analiza itp.)</li>
            <li>
              Opcjonalnie: własne źródła (linki URL lub pliki PDF/DOC/DOCX)
            </li>
            <li>Opcjonalnie: wytyczne dodatkowe</li>
            <li>Opcjonalnie: frazy SEO i linki do umieszczenia w tekście</li>
          </ul>
        </li>
        <li>
          Cena usługi wynosi <strong>3,99 zł za 1000 znaków</strong> tekstu.
          Ostateczna cena Zamówienia jest wyświetlana przed jego złożeniem.
        </li>
        <li>
          Czas realizacji Zamówienia wynosi zazwyczaj 10-20 minut, w zależności
          od długości i złożoności tekstu.
        </li>
        <li>
          Wygenerowana treść jest dostępna w panelu Użytkownika w formatach:
          <ul className="list-disc pl-6 mt-2">
            <li>HTML (do kopiowania)</li>
            <li>Plain text (do kopiowania)</li>
            <li>PDF (do pobrania)</li>
            <li>DOCX (do pobrania)</li>
          </ul>
        </li>
        <li>
          Użytkownik ma możliwość edycji wygenerowanego tekstu w wbudowanym
          edytorze WYSIWYG przed pobraniem.
        </li>
        <li>
          Usługodawca dokłada wszelkich starań, aby wygenerowane treści były:
          <ul className="list-disc pl-6 mt-2">
            <li>Oryginalne (nieplagiatowane)</li>
            <li>Merytorycznie poprawne</li>
            <li>Zgodne ze specyfikacją Zamówienia</li>
          </ul>
        </li>
        <li>
          <strong>Usługodawca nie ponosi odpowiedzialności za:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Ewentualne błędy merytoryczne w wygenerowanych treściach –
              Użytkownik zobowiązany jest do weryfikacji treści przed ich
              użyciem
            </li>
            <li>
              Skutki wykorzystania wygenerowanych treści w celach komercyjnych,
              marketingowych lub innych
            </li>
            <li>
              Zgodność wygenerowanych treści z przepisami prawa krajowego lub
              międzynarodowego
            </li>
          </ul>
        </li>
        <li>
          Użytkownik ponosi wyłączną odpowiedzialność za sposób wykorzystania
          wygenerowanych treści.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 4. Płatności i doładowania konta
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Korzystanie z usług generowania treści wymaga posiadania
          wystarczającej ilości Środków na Koncie.
        </li>
        <li>
          Użytkownik doładowuje Konto poprzez system płatności Stripe,
          akceptując metody:
          <ul className="list-disc pl-6 mt-2">
            <li>Karty płatnicze (Visa, Mastercard, American Express)</li>
            <li>BLIK</li>
            <li>Przelewy24</li>
            <li>Apple Pay / Google Pay</li>
          </ul>
        </li>
        <li>
          Minimalna kwota doładowania wynosi <strong>5,00 zł</strong>.
        </li>
        <li>
          Doładowanie następuje w relacji 1:1 – doładowanie na kwotę 100 zł
          oznacza przyznanie 100 Środków.
        </li>
        <li>
          Środki są przyznawane natychmiast po potwierdzeniu płatności przez
          system Stripe.
        </li>
        <li>
          <strong>Środki nie wygasają</strong> i mogą być wykorzystane w
          dowolnym momencie.
        </li>
        <li>
          W przypadku złożenia Zamówienia, odpowiednia kwota Środków jest
          pobierana z Konta Użytkownika automatycznie przed rozpoczęciem
          generowania treści.
        </li>
        <li>
          Za każdą transakcję (doładowanie, Zamówienie) Użytkownik otrzymuje
          potwierdzenie na adres email oraz w historii transakcji na Koncie.
        </li>
        <li>
          <strong>Zwrot Środków:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Środki niewykorzystane na Koncie nie podlegają zwrotowi w formie
              pieniężnej.
            </li>
            <li>
              Zwrot może nastąpić wyłącznie w przypadku błędu technicznego po
              stronie Usługodawcy, po weryfikacji przez zespół wsparcia.
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold dark:text-white mb-4 text-red-600">
        § 5. Odstąpienie od umowy – Produkty cyfrowe
      </h2>
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 mb-4">
        <p className="text-red-800 dark:text-red-200 font-semibold">
          ⚠️ UWAGA: Prawo odstąpienia od umowy nie przysługuje w przypadku
          produktów cyfrowych!
        </p>
      </div>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Zgodnie z <strong>art. 38 pkt 13 ustawy o prawach konsumenta</strong>,
          prawo odstąpienia od umowy zawartej na odległość{" "}
          <strong>nie przysługuje konsumentowi</strong> w odniesieniu do umów:
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">
            „o dostarczanie treści cyfrowych niedostarczanych na nośniku
            materialnym, za które konsument jest zobowiązany do zapłaty ceny,
            jeżeli przedsiębiorca rozpoczął świadczenie za wyraźną i uprzednią
            zgodą konsumenta, który został poinformowany przed rozpoczęciem
            świadczenia, że po spełnieniu świadczenia przez przedsiębiorcę
            utraci prawo odstąpienia od umowy, i przyjął to do wiadomości, a
            przedsiębiorca przekazał konsumentowi potwierdzenie."
          </blockquote>
        </li>
        <li>
          <strong>W związku z powyższym:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              Składając Zamówienie, Użytkownik będący Konsumentem lub
              Przedsiębiorcą na prawach konsumenta{" "}
              <strong>
                wyraża wyraźną zgodę na natychmiastowe rozpoczęcie realizacji
                usługi
              </strong>{" "}
              (generowania treści cyfrowej).
            </li>
            <li>
              Użytkownik zostaje poinformowany, że po rozpoczęciu generowania
              treści <strong>traci prawo odstąpienia od umowy</strong>.
            </li>
            <li>
              Po złożeniu Zamówienia i pobraniu Środków z Konta, realizacja
              zamówienia rozpoczyna się automatycznie.
            </li>
          </ul>
        </li>
        <li>
          <strong>Zwrot należności możliwy jest wyłącznie w przypadku:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Błędu technicznego po stronie Usługodawcy uniemożliwiającego
              realizację Zamówienia
            </li>
            <li>Podwójnego pobrania płatności za to samo Zamówienie</li>
            <li>
              Innych okoliczności leżących wyłącznie po stronie Usługodawcy,
              ocenianych indywidualnie
            </li>
          </ul>
        </li>
        <li>
          <strong>Nie podlegają zwrotowi:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Zamówienia prawidłowo zrealizowane</li>
            <li>
              Zamówienia, których wynik nie spełnia subiektywnych oczekiwań
              Użytkownika
            </li>
            <li>
              Zamówienia zawierające niejasne lub sprzeczne wytyczne ze strony
              Użytkownika
            </li>
          </ul>
        </li>
        <li>
          W przypadku reklamacji dotyczącej wygenerowanej treści, Użytkownik
          powinien skontaktować się z działem wsparcia przez formularz
          kontaktowy lub email.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 6. Prawa autorskie i licencja
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Wygenerowane treści cyfrowe (teksty) są tworzone przez sztuczną
          inteligencję na podstawie algorytmów i modeli językowych.
        </li>
        <li>
          <strong>
            Użytkownik nabywa pełne prawa do wygenerowanych treści
          </strong>{" "}
          i może z nich korzystać bez ograniczeń, w tym:
          <ul className="list-disc pl-6 mt-2">
            <li>Publikować na stronach internetowych</li>
            <li>Wykorzystywać w materiałach marketingowych</li>
            <li>Modyfikować i adaptować</li>
            <li>Wykorzystywać komercyjnie</li>
          </ul>
        </li>
        <li>
          Użytkownik jest świadomy, że wygenerowane treści mogą zawierać
          fragmenty oparte na publicznie dostępnych źródłach internetowych i
          zobowiązuje się do ich weryfikacji przed użyciem.
        </li>
        <li>
          Usługodawca nie gwarantuje, że wygenerowane treści nie naruszają praw
          autorskich osób trzecich. Odpowiedzialność za wykorzystanie treści
          ponosi wyłącznie Użytkownik.
        </li>
        <li>
          Wszelkie elementy Serwisu (logo, interfejs użytkownika, kod źródłowy)
          stanowią własność Usługodawcy i podlegają ochronie prawa autorskiego.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 7. Reklamacje
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Reklamacje dotyczące świadczonych usług można składać:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Elektronicznie na adres: <strong>support@smart-copy.ai</strong>
            </li>
            <li>
              Pisemnie na adres: <strong>86-221 Papowo Biskupie 119/18</strong>
            </li>
          </ul>
        </li>
        <li>
          Reklamacja powinna zawierać:
          <ul className="list-disc pl-6 mt-2">
            <li>Dane Użytkownika (imię, email, adres korespondencyjny)</li>
            <li>Opis problemu</li>
            <li>Numer Zamówienia (jeśli dotyczy)</li>
            <li>Oczekiwania Użytkownika</li>
          </ul>
        </li>
        <li>
          Usługodawca rozpatruje reklamację w terminie{" "}
          <strong>14 dni roboczych</strong> od daty jej otrzymania.
        </li>
        <li>
          Odpowiedź na reklamację zostaje wysłana na adres email podany w
          reklamacji.
        </li>
        <li>
          <strong>Podstawy do uznania reklamacji:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Błąd techniczny uniemożliwiający dostęp do treści</li>
            <li>
              Niezgodność długości tekstu z Zamówieniem (odchylenie powyżej 20%)
            </li>
            <li>Niezgodność języka z Zamówieniem</li>
            <li>Brak możliwości pobrania treści w zadeklarowanych formatach</li>
          </ul>
        </li>
        <li>
          <strong>Reklamacje nieuzasadnione:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Subiektywna ocena jakości treści</li>
            <li>
              Niezadowolenie z tonu lub stylu wypowiedzi (jeśli był zgodny z
              wytycznymi)
            </li>
            <li>
              Błędy merytoryczne w treści (Użytkownik zobowiązany jest do
              weryfikacji)
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 8. Odpowiedzialność
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Usługodawca nie ponosi odpowiedzialności za:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Treść wygenerowanych tekstów – Użytkownik zobowiązany jest do
              weryfikacji przed użyciem
            </li>
            <li>
              Skutki wykorzystania wygenerowanych treści (prawne, wizerunkowe,
              finansowe)
            </li>
            <li>
              Przerwy w dostępie do Serwisu wynikające z przyczyn niezależnych
              od Usługodawcy (np. awarie hostingu, ataki DDoS)
            </li>
            <li>
              Działania osób trzecich (np. nieautoryzowany dostęp do Konta
              wynikający z zaniedbań Użytkownika)
            </li>
          </ul>
        </li>
        <li>
          Usługodawca zastrzega prawo do czasowego wyłączenia Serwisu w celu
          konserwacji, aktualizacji lub naprawy. O planowanych przerwach
          Użytkownicy zostaną poinformowani z wyprzedzeniem.
        </li>
        <li>
          Usługodawca zastrzega prawo do zablokowania Konta Użytkownika w
          przypadku:
          <ul className="list-disc pl-6 mt-2">
            <li>Naruszenia postanowień Regulaminu</li>
            <li>Podejrzenia działalności oszukańczej</li>
            <li>
              Generowania treści niezgodnych z prawem lub dobrymi obyczajami
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 9. Dane osobowe
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>Administratorem danych osobowych Użytkowników jest Usługodawca.</li>
        <li>
          Szczegółowe informacje dotyczące przetwarzania danych osobowych
          znajdują się w{" "}
          <a
            href="/privacy"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Polityce Prywatności
          </a>
          .
        </li>
        <li>
          Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu
          Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
        </li>
        <li>
          W przypadku rejestracji przez Google, dane przekazywane są zgodnie z
          polityką prywatności Google oraz standardem OAuth 2.0.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 10. Postanowienia końcowe
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Regulamin wchodzi w życie z dniem{" "}
          <strong>29 października 2025</strong>.
        </li>
        <li>
          Usługodawca zastrzega sobie prawo do wprowadzania zmian w Regulaminie.
          O zmianach Użytkownicy zostaną poinformowani z wyprzedzeniem minimum 7
          dni.
        </li>
        <li>
          W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy
          prawa polskiego, w szczególności:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą
              elektroniczną
            </li>
            <li>Ustawa z dnia 30 maja 2014 r. o prawach konsumenta</li>
            <li>Ustawa z dnia 23 kwietnia 1964 r. Kodeks cywilny</li>
          </ul>
        </li>
        <li>
          Ewentualne spory będą rozstrzygane przez sąd właściwy miejscowo dla
          siedziby Usługodawcy.
        </li>
        <li>
          Konsument ma prawo do skorzystania z pozasądowych sposobów
          rozpatrywania reklamacji i dochodzenia roszczeń, w szczególności
          poprzez:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Stały polubowny sąd konsumencki przy Wojewódzkim Inspektoracie
              Inspekcji Handlowej
            </li>
            <li>
              Platformę ODR dostępną pod adresem:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📞 Kontakt
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Email:</strong> support@smart-copy.ai
        <br />
        <strong>Adres:</strong> 86-221 Papowo Biskupie 119/18
        <br />
        <strong>NIP:</strong> 9562203948
      </p>
    </section>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🇬🇧 ENGLISH VERSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EnglishTerms = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 1. General Provisions and Definitions
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          These Terms of Service govern the provision of electronic services by
          Smart-Copy.ai, available at <strong>https://smart-copy.ai</strong>{" "}
          (hereinafter referred to as the <strong>"Service"</strong>).
        </li>
        <li>
          The Service administrator and service provider is{" "}
          <strong>eCopywriting.pl Karol Leszczyński</strong>, located at{" "}
          <strong>Poland, Papowo Biskupim 119/18,</strong>, NIP:{" "}
          <strong>9562203948</strong>, REGON: <strong>340627879 </strong>{" "}
          (hereinafter referred to as the <strong>"Service Provider"</strong>).
        </li>
        <li>
          <strong>Definitions used in the Terms:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>User</strong> – a natural person, legal entity, or
              organizational unit without legal personality using the Service.
            </li>
            <li>
              <strong>Consumer</strong> – a User who is a natural person
              performing a legal action not directly related to their business
              or professional activity.
            </li>
            <li>
              <strong>Account</strong> – an individual User account in the
              Service enabling use of services.
            </li>
            <li>
              <strong>Order</strong> – a commission to generate digital content
              (text) by the User.
            </li>
            <li>
              <strong>Digital Content</strong> – AI-generated text in HTML, PDF,
              DOCX formats delivered to the User not supplied on a physical
              medium.
            </li>
            <li>
              <strong>Credits</strong> – virtual currency in the Service,
              purchased by the User through account top-up, used to pay for
              Orders (1 PLN = 1 Credit).
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 2. Registration and User Account
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Using the Service requires creating an Account by completing the
          registration form.
        </li>
        <li>
          Registration can be done through:
          <ul className="list-disc pl-6 mt-2">
            <li>Completing the registration form (email + password)</li>
            <li>Signing in with Google account (OAuth 2.0)</li>
          </ul>
        </li>
        <li>
          For form registration, the User must provide an email address and
          create a password meeting security requirements (minimum 8 characters,
          uppercase letter, lowercase letter, digit).
        </li>
        <li>
          After registration, a verification code will be sent to the provided
          email address. The Account will be activated after entering the
          correct code.
        </li>
        <li>
          For Google registration, the User consents to Google sharing basic
          profile data (name, email address).
        </li>
        <li>
          The User is obliged to provide true data and update it in case of
          changes.
        </li>
        <li>
          The User is obliged to keep login credentials confidential. The
          Service Provider is not liable for unauthorized use of the Account
          resulting from failure to comply with this obligation.
        </li>
        <li>
          Sharing the Account with third parties and creating more than one
          Account by one User without the Service Provider's consent is
          prohibited.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 3. Services Provided by the Service
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          The Service provides digital content generation (texts) using
          artificial intelligence (Claude 4 Sonnet model by Anthropic).
        </li>
        <li>
          The User places an Order specifying:
          <ul className="list-disc pl-6 mt-2">
            <li>Text topic</li>
            <li>Text length (in characters/pages)</li>
            <li>
              Language (Polish, English, German, Spanish, French, Italian,
              Ukrainian, Russian)
            </li>
            <li>Text type (article, report, analysis, etc.)</li>
            <li>Optionally: own sources (URL links or PDF/DOC/DOCX files)</li>
            <li>Optionally: additional guidelines</li>
            <li>Optionally: SEO keywords and links to include in the text</li>
          </ul>
        </li>
        <li>
          The service price is <strong>3.99 PLN per 1000 characters</strong>.
          The final Order price is displayed before placing it.
        </li>
        <li>
          Order completion time is typically 10-20 minutes, depending on text
          length and complexity.
        </li>
        <li>
          Generated content is available in the User panel in formats:
          <ul className="list-disc pl-6 mt-2">
            <li>HTML (for copying)</li>
            <li>Plain text (for copying)</li>
            <li>PDF (for download)</li>
            <li>DOCX (for download)</li>
          </ul>
        </li>
        <li>
          The User can edit the generated text in the built-in WYSIWYG editor
          before downloading.
        </li>
        <li>
          The Service Provider makes every effort to ensure generated content
          is:
          <ul className="list-disc pl-6 mt-2">
            <li>Original (non-plagiarized)</li>
            <li>Factually correct</li>
            <li>Consistent with Order specifications</li>
          </ul>
        </li>
        <li>
          <strong>The Service Provider is not liable for:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Potential factual errors in generated content – the User is
              obliged to verify content before use
            </li>
            <li>
              Consequences of using generated content for commercial, marketing,
              or other purposes
            </li>
            <li>
              Compliance of generated content with national or international law
            </li>
          </ul>
        </li>
        <li>
          The User bears sole responsibility for how generated content is used.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 4. Payments and Account Top-ups
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Using content generation services requires having sufficient Credits
          in the Account.
        </li>
        <li>
          The User tops up the Account through the Stripe payment system,
          accepting methods:
          <ul className="list-disc pl-6 mt-2">
            <li>Payment cards (Visa, Mastercard, American Express)</li>
            <li>BLIK</li>
            <li>Przelewy24</li>
            <li>Apple Pay / Google Pay</li>
          </ul>
        </li>
        <li>
          Minimum top-up amount is <strong>5.00 PLN</strong>.
        </li>
        <li>
          Top-up occurs in 1:1 ratio – topping up 100 PLN means receiving 100
          Credits.
        </li>
        <li>
          Credits are granted immediately after payment confirmation by Stripe
          system.
        </li>
        <li>
          <strong>Credits do not expire</strong> and can be used at any time.
        </li>
        <li>
          When placing an Order, the appropriate amount of Credits is
          automatically deducted from the User's Account before content
          generation begins.
        </li>
        <li>
          For each transaction (top-up, Order), the User receives confirmation
          via email and in transaction history on the Account.
        </li>
        <li>
          <strong>Credit Refunds:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Unused Credits in the Account are not refundable in monetary form.
            </li>
            <li>
              Refund may occur only in case of technical error on the Service
              Provider's side, after verification by support team.
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold  dark:text-white mb-4 text-red-600">
        § 5. Right of Withdrawal – Digital Products
      </h2>
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 mb-4">
        <p className="text-red-800 dark:text-red-200 font-semibold">
          ⚠️ WARNING: The right of withdrawal does not apply to digital
          products!
        </p>
      </div>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          According to applicable consumer protection laws (EU Directive
          2011/83/EU, Polish Consumer Rights Act), the right of withdrawal{" "}
          <strong>does not apply to consumers</strong> regarding contracts:
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">
            "for the supply of digital content which is not supplied on a
            tangible medium if the performance has begun with the consumer's
            prior express consent and acknowledgment that they will lose their
            right of withdrawal."
          </blockquote>
        </li>
        <li>
          <strong>Therefore:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              By placing an Order, the User who is a Consumer{" "}
              <strong>
                expressly consents to immediate service performance
              </strong>{" "}
              (digital content generation).
            </li>
            <li>
              The User is informed that after content generation begins, they{" "}
              <strong>lose the right of withdrawal</strong>.
            </li>
            <li>
              After placing an Order and Credits deduction, Order fulfillment
              begins automatically.
            </li>
          </ul>
        </li>
        <li>
          <strong>Refund is possible only in case of:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>
              Technical error on the Service Provider's side preventing Order
              fulfillment
            </li>
            <li>Double payment charge for the same Order</li>
            <li>
              Other circumstances solely on the Service Provider's side,
              evaluated individually
            </li>
          </ul>
        </li>
        <li>
          <strong>Non-refundable:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Orders properly fulfilled</li>
            <li>
              Orders whose results don't meet User's subjective expectations
            </li>
            <li>
              Orders containing unclear or contradictory guidelines from the
              User
            </li>
          </ul>
        </li>
        <li>
          For complaints regarding generated content, the User should contact
          the support department through contact form or email.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 6. Copyright and License
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Generated digital content (texts) is created by artificial
          intelligence based on algorithms and language models.
        </li>
        <li>
          <strong>The User acquires full rights to generated content</strong>{" "}
          and can use it without restrictions, including:
          <ul className="list-disc pl-6 mt-2">
            <li>Publishing on websites</li>
            <li>Using in marketing materials</li>
            <li>Modifying and adapting</li>
            <li>Commercial use</li>
          </ul>
        </li>
        <li>
          The User is aware that generated content may contain fragments based
          on publicly available internet sources and undertakes to verify them
          before use.
        </li>
        <li>
          The Service Provider does not guarantee that generated content does
          not infringe third-party copyrights. Responsibility for content use
          lies solely with the User.
        </li>
        <li>
          All Service elements (logo, user interface, source code) are property
          of the Service Provider and are protected by copyright law.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 7. Complaints
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          Complaints regarding provided services can be submitted:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Electronically to: <strong>support@smart-copy.ai</strong>
            </li>
            <li>
              In writing to:{" "}
              <strong>Poland, 86-221 Papowo Biskupie 119/18</strong>
            </li>
          </ul>
        </li>
        <li>
          Complaint should include:
          <ul className="list-disc pl-6 mt-2">
            <li>User data (name, email, correspondence address)</li>
            <li>Problem description</li>
            <li>Order number (if applicable)</li>
            <li>User's expectations</li>
          </ul>
        </li>
        <li>
          The Service Provider reviews complaints within{" "}
          <strong>14 business days</strong> from receipt date.
        </li>
        <li>
          Response to complaint is sent to the email address provided in the
          complaint.
        </li>
        <li>
          <strong>Grounds for accepting complaint:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Technical error preventing access to content</li>
            <li>
              Text length inconsistency with Order (deviation more than 20%)
            </li>
            <li>Language inconsistency with Order</li>
            <li>Inability to download content in declared formats</li>
          </ul>
        </li>
        <li>
          <strong>Unjustified complaints:</strong>
          <ul className="list-disc pl-6 mt-2">
            <li>Subjective content quality assessment</li>
            <li>
              Dissatisfaction with tone or style (if consistent with guidelines)
            </li>
            <li>Factual errors in content (User is obliged to verify)</li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 8. Liability
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          The Service Provider is not liable for:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Content of generated texts – the User is obliged to verify before
              use
            </li>
            <li>
              Consequences of using generated content (legal, image, financial)
            </li>
            <li>
              Service access interruptions resulting from causes beyond the
              Service Provider's control (e.g., hosting failures, DDoS attacks)
            </li>
            <li>
              Third-party actions (e.g., unauthorized Account access resulting
              from User negligence)
            </li>
          </ul>
        </li>
        <li>
          The Service Provider reserves the right to temporarily disable the
          Service for maintenance, updates, or repairs. Users will be notified
          of planned interruptions in advance.
        </li>
        <li>
          The Service Provider reserves the right to block a User's Account in
          case of:
          <ul className="list-disc pl-6 mt-2">
            <li>Terms of Service violation</li>
            <li>Suspected fraudulent activity</li>
            <li>Generating content inconsistent with law or good practices</li>
          </ul>
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 9. Personal Data
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          The data controller for Users' personal data is the Service Provider.
        </li>
        <li>
          Detailed information regarding personal data processing can be found
          in the{" "}
          <a
            href="/privacy"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </li>
        <li>
          Personal data is processed in accordance with Regulation (EU) 2016/679
          of the European Parliament and of the Council of 27 April 2016 (GDPR).
        </li>
        <li>
          For Google registration, data is transferred according to Google's
          privacy policy and OAuth 2.0 standard.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        § 10. Final Provisions
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          These Terms of Service come into effect on{" "}
          <strong>October 29, 2025</strong>.
        </li>
        <li>
          The Service Provider reserves the right to make changes to the Terms
          of Service. Users will be notified of changes at least 7 days in
          advance.
        </li>
        <li>
          Matters not covered by the Terms of Service are governed by Polish
          law, in particular:
          <ul className="list-disc pl-6 mt-2">
            <li>Act of July 18, 2002 on Electronic Services Provision</li>
            <li>Act of May 30, 2014 on Consumer Rights</li>
            <li>Act of April 23, 1964 - Civil Code</li>
          </ul>
        </li>
        <li>
          Any disputes will be resolved by the court having jurisdiction over
          the Service Provider's registered office.
        </li>
        <li>
          Consumers have the right to use out-of-court methods of complaint
          handling and claim pursuit, particularly through:
          <ul className="list-disc pl-6 mt-2">
            <li>
              Permanent consumer arbitration court at the Provincial
              Inspectorate of Trade Inspection
            </li>
            <li>
              ODR platform available at:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📞 Contact
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Email:</strong> support@smart-copy.ai
        <br />
        <strong>Address:</strong> 86-221 Papowo Biskupie 119/18
        <br />
        <strong>NIP:</strong> 9562203948
      </p>
    </section>
  </div>
);
