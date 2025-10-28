// frontend/src/pages/AIProductDescriptionsPage.tsx
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  ShoppingCart,
  CheckCircle,
  Package,
  Search,
  Globe,
  DollarSign,
  Clock,
  Target,
  ArrowRight,
  Layers,
  Rocket,
  Tag,
  ShoppingBag,
  Store,
  List,
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export const AIProductDescriptionsPage = () => {
  const benefits = [
    {
      icon: Clock,
      title: "1000 opisów w godzinę",
      description:
        "AI generator opisów produktów tworzy setki unikalnych opisów w czasie, który zajęłoby Ci napisanie jednego.",
    },
    {
      icon: DollarSign,
      title: "95% oszczędności kosztów",
      description:
        "3.99 zł za opis zamiast 50-100 zł za copywritera. Przy 100 produktach to oszczędność 5000+ zł.",
    },
    {
      icon: Search,
      title: "SEO w każdym opisie",
      description:
        "Automatyczna optymalizacja pod Google - słowa kluczowe, nagłówki H1-H3, meta description.",
    },
    {
      icon: Target,
      title: "Konwersyjny copywriting",
      description:
        "AI zna techniki sprzedażowe - benefit selling, storytelling, social proof, pilność.",
    },
    {
      icon: Globe,
      title: "8 języków bez tłumacza",
      description:
        "Opisy produktów po polsku, angielsku, niemiecku i 5 innych językach. Idealne dla marketplace.",
    },
    {
      icon: Layers,
      title: "Opisy kategorii i tagów",
      description:
        "Nie tylko produkty - AI pisze też opisy kategorii, kolekcji, brandów i atrybutów.",
    },
  ];

  const ecommerceTypes = [
    {
      icon: ShoppingBag,
      title: "Sklepy fashion",
      examples: ["Ubrania", "Buty", "Akcesoria", "Biżuteria"],
      features: "Opisy materiałów, kroju, stylizacje",
    },
    {
      icon: Package,
      title: "Elektronika",
      examples: ["Smartfony", "Laptopy", "AGD", "RTV"],
      features: "Specyfikacje techniczne, porównania",
    },
    {
      icon: Store,
      title: "Dom i ogród",
      examples: ["Meble", "Dekoracje", "Narzędzia", "Rośliny"],
      features: "Wymiary, zastosowania, pielęgnacja",
    },
    {
      icon: ShoppingCart,
      title: "Kosmetyki i zdrowie",
      examples: ["Kosmetyki", "Suplementy", "Perfumy", "Pielęgnacja"],
      features: "Składniki, efekty, sposób użycia",
    },
    {
      icon: Tag,
      title: "Sport i hobby",
      examples: ["Rower", "Fitness", "Gry", "Książki"],
      features: "Parametry, zastosowanie, zalety",
    },
    {
      icon: List,
      title: "Marketplace multi-brand",
      examples: ["Allegro", "Amazon", "eBay", "Aliexpress"],
      features: "Opisy dla różnych platform",
    },
  ];

  const descriptionStructures = [
    {
      type: "Opis krótki (300-500 znaków)",
      use: "Karty produktów, miniaturki, listy",
      price: "~2 zł",
      elements: ["Główna korzyść", "USP", "Call to action"],
    },
    {
      type: "Opis standardowy (1000-2000 znaków)",
      use: "Główne karty produktów",
      price: "~4-8 zł",
      elements: ["Nagłówek H1", "Akapit wstępny", "Lista cech", "CTA"],
    },
    {
      type: "Opis rozbudowany (2000-5000 znaków)",
      use: "Produkty premium, SEO",
      price: "~8-20 zł",
      elements: ["Sekcje H2/H3", "Storytelling", "Szczegóły techniczne", "FAQ"],
    },
  ];

  const features = [
    "Unikalne opisy dla każdego wariantu produktu",
    "Automatyczne wykorzystanie atrybutów (kolor, rozmiar, materiał)",
    "Ton dostosowany do grupy docelowej",
    "Wbudowane call-to-action",
    "Zgodność z wytycznymi marketplace (Allegro, Amazon)",
    "Export do CSV, XML, JSON dla WooCommerce, Shopify, PrestaShop",
    "Bulk generation - masowe generowanie",
    "Edytor WYSIWYG do szybkich poprawek",
  ];

  const comparisonData = [
    {
      aspect: "Czas napisania 100 opisów",
      manual: "2-3 tygodnie",
      ai: "1-2 godziny",
    },
    {
      aspect: "Koszt 100 opisów produktów",
      manual: "5,000-10,000 zł",
      ai: "~400 zł",
    },
    {
      aspect: "Opisy w wielu językach",
      manual: "Agencja tłumaczeniowa",
      ai: "Natychmiast w 8 językach",
    },
    {
      aspect: "Aktualizacja po zmianie cen/stock",
      manual: "Ręcznie, czasochłonnie",
      ai: "Automatycznie",
    },
    {
      aspect: "Spójność tone of voice",
      manual: "Trudna przy wielu copywriterach",
      ai: "100% spójna",
    },
  ];

  const useCases = [
    {
      scenario: "Nowy sklep - 500 produktów",
      challenge:
        "Potrzebujesz opisać cały asortyment przed uruchomieniem sklepu",
      solution:
        "AI generator opisów produktów tworzy wszystkie opisy w 2 dni zamiast 3 miesięcy.",
      savings: "Oszczędność: ~25,000 zł i 3 miesiące",
    },
    {
      scenario: "Rozszerzenie na marketplace",
      challenge:
        "Wchodzisz na Allegro/Amazon i potrzebujesz dostosować opisy pod ich wytyczne",
      solution:
        "AI przepisuje opisy zgodnie z wymogami każdej platformy, optymalizując pod ich algorytmy.",
      savings: "Oszczędność: ~10,000 zł i 1 miesiąc",
    },
    {
      scenario: "Ekspansja zagraniczna",
      challenge:
        "Chcesz sprzedawać w Niemczech i UK - potrzebujesz tłumaczeń 1000 produktów",
      solution:
        "AI tworzy natywne opisy w niemieckim i angielskim, nie tłumaczenia maszynowe.",
      savings: "Oszczędność: ~30,000 zł i 2 miesiące",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Import danych produktowych",
      description:
        "Wklejasz CSV z nazwami produktów i podstawowymi atrybutami lub dodajesz ręcznie po kolei.",
    },
    {
      step: 2,
      title: "Wybór szablonu i tonu",
      description:
        "Określasz długość, styl (profesjonalny/casualowy/luksusowy) i język docelowy.",
    },
    {
      step: 3,
      title: "AI generuje opisy",
      description:
        "Sztuczna inteligencja do opisów produktów tworzy unikalne, SEO-friendly treści w kilka minut.",
    },
    {
      step: 4,
      title: "Edycja i export",
      description:
        "Poprawiasz szczegóły w edytorze, eksportujesz CSV/JSON do swojego sklepu.",
    },
  ];

  const faq = [
    {
      question: "Czy AI generator opisów produktów tworzy unikalne treści?",
      answer:
        "Tak! Każdy opis jest w 100% unikalny. AI nie kopiuje ze źródeł ani z innych produktów. Możesz wkleić do plagiat checkera - będzie 100% oryginalności. Nawet dla podobnych produktów (np. różne kolory tej samej koszulki) AI tworzy odmienne opisy.",
    },
    {
      question: "Jak AI wie, co napisać o moim produkcie?",
      answer:
        "Podajesz podstawowe dane: nazwę produktu, kategorię, atrybuty (np. materiał, kolor, rozmiar), cenę. AI analizuje te informacje, wyszukuje kontekst w internecie i tworzy profesjonalny opis. Możesz też dodać własne bullet pointy, które AI rozwinie w pełny tekst.",
    },
    {
      question: "Czy opisy są zoptymalizowane pod Google?",
      answer:
        "Tak! Sztuczna inteligencja do opisów produktów automatycznie: wstawia słowa kluczowe naturalnie, tworzy strukturę H1-H3, optymalizuje długość (minimum 300 znaków dla SEO), dodaje wewnętrzne linki (jeśli podasz), generuje meta description.",
    },
    {
      question:
        "Czy mogę generować opisy dla Allegro, Amazon, własnego sklepu?",
      answer:
        "Oczywiście! AI generator dostosowuje opisy do wymagań każdej platformy: Allegro (maksymalnie 50,000 znaków w HTML), Amazon (do 2000 znaków plain text, bullet pointy), WooCommerce/Shopify (pełny HTML z tagami). Możesz wygenerować różne wersje tego samego produktu.",
    },
    {
      question: "Ile kosztuje wygenerowanie opisów 100 produktów?",
      answer:
        "Zależy od długości. Krótkie opisy (300-500 znaków): ~200 zł za 100 sztuk. Standardowe (1000-2000 znaków): ~400-800 zł. Długie SEO (3000-5000 znaków): ~1200-2000 zł. To 10-20x taniej niż copywriter (5000-10,000 zł za 100 opisów).",
    },
    {
      question: "Czy AI potrafi pisać w branżowym żargonie (np. technicznym)?",
      answer:
        "Tak! AI generator opisów produktów zna terminologię z: elektroniki (parametry techniczne, specyfikacje), mody (nazwy tkanin, kroje, style), kosmetyków (składniki INCI, działanie), sportu (parametry treningowe), motoryzacji (części, specyfikacje). Podajesz niszę, AI dostosowuje język.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          AI generator opisów produktów | Sztuczna inteligencja do e-commerce -
          Smart-Copy.ai
        </title>
        <meta
          name="description"
          content="AI generator opisów produktów Smart-Copy.ai - profesjonalne opisy dla sklepów internetowych. Sztuczna inteligencja tworzy unikalne, SEO-friendly opisy produktów i kategorii w 8 językach. Od 3.99 zł/1000 znaków."
        />
        <meta
          name="keywords"
          content="AI generator opisów produktów, sztuczna inteligencja opisy produktów, automatyczne opisy produktów, AI e-commerce, generator opisów sklepu, opisy kategorii AI"
        />
        <link
          rel="canonical"
          href="https://smart-copy.ai/ai-generator-opisow-produktow"
        />
        <meta
          property="og:title"
          content="AI generator opisów produktów | Smart-Copy.ai"
        />
        <meta
          property="og:description"
          content="Generuj setki unikalnych opisów produktów w godzinę. AI dla e-commerce w 8 językach. 10x taniej niż copywriter."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://smart-copy.ai/ai-generator-opisow-produktow"
        />
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -45, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"
            />
          </div>

          <div className="container-custom py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full mb-8 border border-emerald-200 dark:border-emerald-800"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">
                  AI dla sklepów internetowych
                </span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                AI generator
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  opisów produktów
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto font-light">
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Sztuczna inteligencja
                </strong>{" "}
                tworzy unikalne opisy produktów i kategorii dla e-commerce.
                <br className="hidden md:block" />
                1000 opisów w godzinę. SEO-friendly. 8 języków. Od 3.99 zł za
                1000 znaków.
              </p>

              {/* Value props */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    100 opisów = ~400 zł (vs 5000 zł copywriter)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Unikalne, nie duplikaty
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Export CSV/JSON/XML
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="group btn btn-primary text-lg px-10 py-5 shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Zacznij generować opisy
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <a
                  href="#jak-dziala"
                  className="btn btn-secondary text-lg px-10 py-5 border-2"
                >
                  Zobacz jak działa
                </a>
              </div>

              {/* Trust signals */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✓ Doładuj od 5 zł ✓ Płać tylko za to czego używasz ✓ Bez
                subskrypcji
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Dlaczego AI generator opisów produktów?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Skaluj swój e-commerce bez wydawania fortuny na copywriterów
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group card dark:bg-gray-700 dark:border-gray-600 hover:shadow-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="jak-dziala"
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Jak działa generator opisów produktów?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Od importu danych do gotowych opisów w 4 krokach
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent dark:from-emerald-700 -ml-4" />
                  )}

                  <div className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all h-full relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-white">
                        {String(item.step).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-16">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* E-commerce Types */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI dla każdej branży e-commerce
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Sztuczna inteligencja zna specyfikę Twojej branży
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecommerceTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {type.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {type.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">
                      AI generuje:
                    </strong>{" "}
                    {type.features}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Description Types & Pricing */}
        <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Rodzaje i ceny opisów produktów
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wybierz długość i strukturę dopasowaną do Twojego sklepu
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {descriptionStructures.map((desc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-2xl transition-all"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                      {desc.price}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {desc.type}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {desc.use}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {desc.elements.map((element, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{element}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Funkcje AI generatora
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wszystko czego potrzebuje Twój e-commerce
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Ręczne vs{" "}
                <span className="text-emerald-600">AI opisy produktów</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Porównanie tradycyjnego copywritingu z generatorem AI
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <div className="font-bold text-lg">Aspekt</div>
                  <div className="font-bold text-lg text-center">
                    Ręczne pisanie
                  </div>
                  <div className="font-bold text-lg text-center">
                    Generator AI
                  </div>
                </div>

                {comparisonData.map((row, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`grid grid-cols-3 gap-4 p-6 ${
                      index % 2 === 0
                        ? "bg-gray-50 dark:bg-gray-900"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {row.aspect}
                    </div>
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      {row.manual}
                    </div>
                    <div className="text-center font-bold text-green-600 dark:text-green-400">
                      {row.ai}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Przykłady zastosowań
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Jak AI generator oszczędza czas i pieniądze w e-commerce
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card dark:bg-gray-700 dark:border-gray-600"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg inline-block mb-4">
                    <span className="font-bold">{useCase.scenario}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Wyzwanie:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {useCase.challenge}
                  </p>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Rozwiązanie:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {useCase.solution}
                  </p>

                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {useCase.savings}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Najczęstsze pytania
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wszystko o AI generatorze opisów produktów
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faq.map((item, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-4">
                      {item.question}
                    </h3>
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform">
                      <ArrowRight className="w-5 h-5 text-white transform rotate-90" />
                    </div>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />

          <div className="container-custom text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
                <Package className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">
                  Skaluj swój sklep bez limitu
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Zacznij generować opisy
                <br />
                produktów już dziś
              </h2>

              <p className="text-xl md:text-2xl text-emerald-100 mb-10 max-w-3xl mx-auto">
                AI generator opisów produktów Smart-Copy.ai - sztuczna
                inteligencja dla e-commerce. 1000 opisów w godzinę, 10x taniej
                niż copywriter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 transform"
                >
                  Stwórz konto i doładuj
                  <Rocket className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Mam już konto
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <p className="text-emerald-100">
                ✓ Doładuj od 5 zł ✓ 3.99 zł za 1000 znaków ✓ Bez zobowiązań
              </p>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};
