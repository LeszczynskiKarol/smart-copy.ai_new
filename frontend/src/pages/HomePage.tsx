// frontend/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  Sparkles,
  CheckCircle,
  Maximize2,
  Target,
  Edit,
  Globe,
  Brain,
  FileText,
  Edit3,
  Download,
  Search,
  Users,
  ArrowRight,
  Star,
  Rocket,
  BarChart3,
  ShieldCheck,
  Upload,
  Wallet,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export const HomePage = () => {
  const features = [
    {
      icon: Brain,
      title: "Zaawansowane modele AI Claude",
      description:
        "Wykorzystujemy najnowszy model Claude Sonnet 4.5 do pisania tekstów - ten sam AI, którego używają największe firmy na świecie.",
    },
    {
      icon: Search,
      title: "Automatyczne wyszukiwanie informacji",
      description:
        "Nasz generator tekstów AI automatycznie wyszukuje i analizuje źródła w internecie, aby stworzyć merytorycznie poprawną treść.",
    },
    {
      icon: FileText,
      title: "Własne źródła",
      description:
        "Jeśli chcesz, możesz dodać własne dokumenty i strony jako materiały źródłowe - AI wykorzysta je priorytetowo do generowania treści.",
    },
    {
      icon: Globe,
      title: "8 języków",
      description:
        "Tworzenie tekstów AI w polskim, angielskim, niemieckim, hiszpańskim, francuskim, włoskim, ukraińskim i rosyjskim. Wpisz wytyczne po polsku, generuj treść w innym języku.",
    },
    {
      icon: Edit3,
      title: "Edytor WYSIWYG",
      description:
        "Pełna kontrola nad treścią - edytuj w czasie rzeczywistym wygenerowany tekst w intuicyjnym edytorze z formatowaniem HTML.",
    },
    {
      icon: Download,
      title: "Export do PDF i DOCX",
      description:
        "Pobieraj gotowy content w formatach PDF, DOCX, HTML lub kopiuj jako plain text - jak Ci wygodnie.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Opisz, czego potrzebujesz",
      description:
        "Podaj temat, długość, język i dodaj opcjonalne wytyczne. Generator treści AI zrozumie Twoje potrzeby.",
    },
    {
      number: "02",
      title: "AI wyszukuje informacje",
      description:
        "Sztuczna inteligencja automatycznie wyszukuje, analizuje i klasyfikuje najlepsze źródła w internecie dla Twojego tematu.",
    },
    {
      number: "03",
      title: "Generowanie treści",
      description:
        "AI tworzy w pełni oryginalny, wartościowy i merytoryczny tekst dostosowany do Twoich wymagań - bez kopiowania ze źródeł.",
    },
    {
      number: "04",
      title: "Edycja i export",
      description:
        "Edytuj treść w wygodnym edytorze i pobieraj w formacie PDF, DOCX lub kopiuj bezpośrednio do swojego CMS jako HTML.",
    },
  ];

  const useCases = [
    {
      icon: FileText,
      title: "Artykuły blogowe",
      description: "SEO-friendly AI content",
    },
    {
      icon: Target,
      title: "Opisy produktów",
      description: "Oryginalne i zoptymalizowane pod SEO opisy dla e-commerce",
    },
    {
      icon: BarChart3,
      title: "Raporty i analizy",
      description: "Profesjonalne dokumenty biznesowe, naukowe, analityczne",
    },
    {
      icon: Users,
      title: "Content marketing",
      description: "Treści sprzedażowe i marketingowe",
    },
    {
      icon: Rocket,
      title: "Posty social media",
      description: "Angażujące treści na platformy społecznościowe",
    },
    {
      icon: Star,
      title: "Teksty na strony WWW",
      description:
        "Wartościowe treści na strony firmowe, do wizytówek, jako opisy",
    },
  ];

  const stats = [
    { value: "1000+", label: "Wygenerowanych tekstów" },
    { value: "2-150", label: "Stron tekstu" },
    { value: "8", label: "Języków" },
    { value: "10 min", label: "Średni czas generowania" },
  ];

  const comparison = [
    {
      aspect: "Czas tworzenia 10-stronicowego artykułu",
      traditional: "8-12 godzin",
      ai: "10-20 minut",
    },
    {
      aspect: "Research i weryfikacja źródeł",
      traditional: "2-3 godziny",
      ai: "Automatyczny",
    },
    {
      aspect: "Koszt copywritera (artykuł 10 str.)",
      traditional: "300-800 zł",
      ai: "~40 zł",
    },
    {
      aspect: "Wielojęzyczność",
      traditional: "Tłumacz dla każdego języka",
      ai: "Natywne 8 języków",
    },
    {
      aspect: "Dostępność 24/7",
      traditional: "Nie",
      ai: "Tak",
    },
  ];

  const faq = [
    {
      question: "Czy generator tekstów AI tworzy oryginalne treści?",
      answer:
        "Tak! Nasza sztuczna inteligencja do tekstów nigdy nie kopiuje treści ze źródeł. AI analizuje informacje i pisze w pełni oryginalny tekst własnymi słowami, dostosowany do Twoich wytycznych.",
    },
    {
      question: "W jakich językach działa Smart-Copy.AI?",
      answer:
        "Generator treści AI obsługuje 8 języków: polski, angielski, niemiecki, hiszpański, francuski, włoski, ukraiński i rosyjski. Możesz generować content w każdym z tych języków z pełnym uwzględnieniem gramatyki i stylu.",
    },
    {
      question: "Jak długie teksty może wygenerować AI?",
      answer:
        "Smart-Copy obsługuje teksty od 2000 znaków (1 strona) do ok. 300 000 znaków (ok. 150 stron). Możesz zamówić krótkie opisy produktów, długie artykuł blogowe, tekst do ebooka czy raport analityczny.",
    },
    {
      question: "Czy mogę dodać własne materiały źródłowe?",
      answer:
        "Tak! Możesz dodać do 6 własnych źródeł (linki do stron lub pliki PDF/DOC/DOCX). Content generator AI wykorzysta je priorytetowo, tworząc tekst oparty głównie na Twoich materiałach.",
    },
    {
      question: "Ile kosztuje generowanie treści?",
      answer:
        "Cena wynosi 3,99 zł za 1000 znaków. Przykładowo: 1 strona (2000 znaków) = 7,98 zł, artykuł 10-stronicowy = ~40 zł. To 10 x tańsze niż tradycyjny copywriting!",
    },
    {
      question: "Czy treści są SEO-friendly?",
      answer:
        "Tak! Generator tekstów AI tworzy treści zoptymalizowane pod SEO - naturalne użycie słów kluczowych, poprawna struktura nagłówków H1-H3, wysoką unikalność i wartość merytoryczną.",
    },
  ];

  // Nowa sekcja - wyróżniki
  const distinctions = [
    {
      icon: Maximize2,
      title: "Bardzo długie teksty",
      subtitle: "Do 300 000 znaków w jednym zleceniu",
      description:
        "W przeciwieństwie do innych generatorów AI, które limitują długość, Smart-Copy.ai pozwala tworzyć kompleksowe treści do 300 000 znaków (około 150 stron A4). Idealne do długich raportów, e-booków, dokumentacji technicznej czy obszernych artykułów merytorycznych.",
      features: [
        "Ebooki, analizy, opracowania, raporty do 150 stron",
        "Spójność treści na całej długości",
        "Automatyczna struktura i formatowanie",
        "Optymalizacja SEO, poprawność językowa",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Wiarygodne źródła i research",
      subtitle: "Proces weryfikacji w 4 krokach",
      description:
        "Nasza sztuczna inteligencja nie wymyśla informacji. Każdy tekst powstaje w oparciu o starannie zweryfikowane źródła internetowe, które są dobierane odpowiednio do Twojego tekstu.",
      features: [
        "Wyszukiwanie - AI przeszukuje Google i znajduje najlepsze źródła dla Twojego tematu",
        "Scraping - Automatyczne pobieranie i ekstrakcja treści ze stron WWW",
        "Analiza - AI weryfikuje rzetelność, aktualność i wiarygodność źródeł",
        "Generowanie - Tworzenie oryginalnej treści z pełnym wykorzystaniem źródeł",
      ],
      isProcess: true,
    },
    {
      icon: Wallet,
      title: "Bez zobowiązań i subskrypcji",
      subtitle: "Płać tylko za to, czego używasz",
      description:
        "W przeciwieństwie do wielu innych platform AI działających w modelu subskrypcyjnym w Smart-Copy.ai oszczędzasz realne środki, bez żadnych miesięcznych zobowiązań.",
      features: [
        "Brak miesięcznych opłat - tworzysz teksty, gdy potrzebujesz",
        "Doładuj konto od 5 zł - bez minimalnych pakietów",
        "Środki nie wygasają - wykorzystasz, je kiedy chcesz",
        "Oszczędzaj pieniądze dzięki korzystnym cenom - tylko 3,99 zł/1000 znaków",
      ],
      comparison: {
        others: [
          "Abonament 50-300 zł/mies",
          "Limit słów miesięcznie",
          "Abonament pozostaje niewykorzystany",
        ],
        us: [
          "0 zł stałych kosztów",
          "Płacisz za napisane słowa",
          "Środki bez daty ważności",
        ],
      },
    },
    {
      icon: Upload,
      title: "Własne źródła wiedzy",
      subtitle: "Linki + pliki = oryginalna treść",
      description:
        "Dodaj do 6 własnych materiałów źródłowych - linki do stron WWW lub pliki w formatach PDF, DOC, DOCX. AI wykorzysta je priorytetowo, tworząc unikalne treści w oparciu o wiedzę, którą Ty dostarczasz.",
      features: [
        "Dokumenty firmowe - raporty, prezentacje, materiały wewnętrzne",
        "Strony WWW - Twoja strona, konkurencja, artykuły branżowe",
        "Materiały eksperckie - e-booki, white papers, case studies",
        "100% oryginalność - AI nie kopiuje, tylko przetwarza i syntetyzuje",
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Generator Tekstów AI | Sztuczna Inteligencja do Tworzenia Treści -
          Smart-Copy.ai
        </title>
        <meta
          name="description"
          content="Generator tekstów AI Smart-Copy.ai - profesjonalne tworzenie treści ze sztuczną inteligencją. Content generator w 8 językach. Artykuły, opisy produktów, raporty. Od 3.99 zł/1000 znaków. Załóż konto!"
        />
        <meta
          name="keywords"
          content="generator tekstów AI, sztuczna inteligencja do tekstów, tworzenie tekstów AI, content generator, generowanie treści, generator treści AI, AI copywriting, automatyczne pisanie tekstów"
        />
        <link rel="canonical" href="https://smart-copy.ai" />
        <meta
          property="og:title"
          content="Generator tekstów AI | Sztuczna inteligencja do tworzenia treści"
        />
        <meta
          property="og:description"
          content="Profesjonalny generator treści AI. Twórz artykuły, opisy produktów i raporty w 8 językach. 10x szybciej i taniej niż tradycyjny copywriting."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smart-copy.ai" />
      </Helmet>
      <Layout>
        {/* Hero Section - Enhanced SEO */}
        <section className="relative min-h-[95vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl"
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full mb-8 border border-purple-200 dark:border-purple-800"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI Content Generator</span>
              </motion.div>

              {/* Main Heading - SEO optimized */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Sztuczna inteligencja
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  do pisania tekstów
                </span>
              </h1>

              {/* Subtitle with SEO keywords */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto font-light">
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Tworzenie treści z AI
                </strong>{" "}
                - generuj wartościowe, interesujące i rzetelne teksty blogowe,
                raporty, opracowania, ebooki i inne treści już za 3,99 zł za
                1000 znaków.
              </p>

              {/* Value props */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    20 x szybciej niż copywriter
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Oryginalny content bez plagiatu
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Export PDF, DOCX, HTML
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <Edit className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Live Editor
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="group btn btn-primary text-lg px-10 py-5 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Załóż konto
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <a
                  href="#jak-dziala"
                  className="btn btn-secondary text-lg px-10 py-5 border-2 hover:bg-gray-50 dark:hover:bg-gray-200 text-gray-700 dark:text-gray-700"
                >
                  Zobacz, jak działa
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="container-custom">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
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
                Jak działa{" "}
                <span className="text-purple-600">Smart-Copy.ai</span>?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Sztuczna inteligencja do pisania tekstów, która automatyzuje
                research, pisanie i formatowanie
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-700 -ml-4" />
                  )}

                  <div className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all h-full relative overflow-hidden group">
                    {/* Number badge */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-16">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section id="features" className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Funkcje generatora treści AI
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wszystko, czego potrzebujesz do profesjonalnego generowania
                treści w jednym narzędziu
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group card dark:bg-gray-700 dark:border-gray-600 hover:shadow-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🆕 CO WYRÓŻNIA SMART-COPY.AI - NOWA SEKCJA */}
        <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"
            />
          </div>

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-block mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  <Star className="w-5 h-5" />
                  PRZEWAGA KONKURENCYJNA
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Co wyróżnia{" "}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Smart-Copy.ai
                </span>
                ?
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
                Generator tekstów inny niż wszystkie
              </p>
            </motion.div>

            {/* Distinctions Grid */}
            <div className="space-y-12">
              {distinctions.map((distinction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Left - Header & Description */}
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <distinction.icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                              {distinction.title}
                            </h3>
                            <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                              {distinction.subtitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                          {distinction.description}
                        </p>

                        {/* Comparison table dla "Bez zobowiązań" */}
                        {distinction.comparison && (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 mb-6">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Inne aplikacje */}
                              <div>
                                <div className="flex items-center gap-2 mb-4">
                                  <X className="w-5 h-5 text-red-500" />
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    Inne aplikacje
                                  </span>
                                </div>
                                <ul className="space-y-2">
                                  {distinction.comparison.others.map(
                                    (item, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              {/* Smart-Copy.ai */}
                              <div>
                                <div className="flex items-center gap-2 mb-4">
                                  <Check className="w-5 h-5 text-green-500" />
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    Smart-Copy.ai
                                  </span>
                                </div>
                                <ul className="space-y-2">
                                  {distinction.comparison.us.map((item, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium"
                                    >
                                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right - Features/Process */}
                      <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 md:p-12 flex flex-col justify-center">
                        {distinction.isProcess ? (
                          // Process steps dla "Wiarygodne źródła"
                          <div className="space-y-6">
                            <div className="mb-4">
                              <div className="inline-block bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                  PROCES RESEARCH
                                </span>
                              </div>
                            </div>
                            {distinction.features.map((step, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: i * 0.1,
                                }}
                                viewport={{ once: true }}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                                  {i + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          // Standard features list
                          <ul className="space-y-5">
                            {distinction.features.map((feature, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: i * 0.1,
                                }}
                                viewport={{ once: true }}
                                className="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                  {feature}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all"
              >
                <Rocket className="w-6 h-6" />
                Załóż konto
                <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Rejestracja bez karty kredytowej
              </p>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
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
                Zastosowania
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Smart-Copy.ai to idealny generator do każdego rodzaju treści -
                od krótkich artykułów blogowych po rozległe opracowania naukowe
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <useCase.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
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
                Tradycyjne pisanie vs{" "}
                <span className="text-purple-600">generowanie treści AI</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Zobacz różnicę między klasycznym copywritingiem a sztuczną
                inteligencją do pisania tekstów
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <div className="font-bold text-lg">Aspekt</div>
                  <div className="font-bold text-lg text-center">
                    Tradycyjnie
                  </div>
                  <div className="font-bold text-lg text-center">
                    Smart-Copy AI
                  </div>
                </div>

                {/* Rows */}
                {comparison.map((row, index) => (
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
                      {row.traditional}
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

        {/* Pricing Preview */}
        <section id="pricing" className="py-24 bg-white dark:bg-gray-800">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Przejrzyste ceny bez subskrypcji
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Płać tylko za to, czego używasz. Generator tekstów AI bez
                ukrytych kosztów.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-700 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-purple-500"
              >
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                    3,99 zł
                  </div>
                  <div className="text-xl text-gray-600 dark:text-gray-400">
                    za 1000 znaków (pół strony A4)
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      ~8 zł
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      1 strona (2000 znaków)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      ~40 zł
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Artykuł 10-str (20k znaków)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      ~200 zł
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Raport 50-str (100k znaków)
                    </div>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block w-full btn btn-primary text-lg py-4 text-center"
                >
                  Załóż konto →
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section - SEO optimized */}
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
                Najczęściej zadawane pytania
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wszystko, co chcesz wiedzieć o sztucznej inteligencji do pisania
                tekstów
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
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-4">
                      {item.question}
                    </h3>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform">
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

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
          {/* Animated background elements */}
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
            className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
          />

          <div className="container-custom text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Zacznij generować profesjonalne
                <br />
                treści już dziś
              </h2>

              <p className="text-xl md:text-2xl text-purple-100 mb-10 max-w-3xl mx-auto">
                Generator tekstów AI Smart-Copy.ai to najszybszy sposób na
                tworzenie wysokiej jakości contentu w doskonałych cenach. Załóż
                konto i zacznij oszczędzać na treściach bez kompromisów
                jakościowych!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 transform"
                >
                  Załóż konto
                  <Rocket className="w-5 h-5" />
                </Link>
              </div>

              <p className="text-purple-100">
                ✓ Bez karty kredytowej ✓ Bez zobowiązań ✓ 3,99 zł/1000 znaków
              </p>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};
