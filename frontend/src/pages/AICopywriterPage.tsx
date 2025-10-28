// frontend/src/pages/AICopywriterPage.tsx
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  Target,
  CheckCircle,
  FileText,
  Rocket,
  Users,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Award,
  Clock,
  DollarSign,
  Globe,
  Lightbulb,
  Pen,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export const AICopywriterPage = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Oszczędność czasu",
      description:
        "AI copywriter tworzy w 5 minut to, co tradycyjny copywriter pisze 8 godzin.",
    },
    {
      icon: DollarSign,
      title: "Niższe koszty",
      description:
        "Płać 40 zł za artykuł zamiast 500-800 zł za copywritera. To 95% oszczędności!",
    },
    {
      icon: Lightbulb,
      title: "Kreatywność AI",
      description:
        "AI pisarz generuje pomysły i warianty tekstów, których człowiek by nie wymyślił.",
    },
    {
      icon: Globe,
      title: "8 języków natywnie",
      description:
        "Copy AI pisze w polskim, angielskim, niemieckim, hiszpańskim i 4 innych językach.",
    },
    {
      icon: Target,
      title: "Konwersyjna treść",
      description:
        "AI writer zna techniki copywritingu - AIDA, PAS, storytelling, CTA.",
    },
    {
      icon: BarChart3,
      title: "SEO-friendly",
      description:
        "AI copywriter automatycznie optymalizuje teksty pod wyszukiwarki Google.",
    },
  ];

  const copywritingTypes = [
    {
      icon: FileText,
      title: "Artykuły blogowe",
      examples: [
        "Poradniki",
        "Artykuły eksperckie",
        "Listicles",
        "Case studies",
      ],
      price: "od 40 zł",
    },
    {
      icon: Target,
      title: "Copywriting sprzedażowy",
      examples: [
        "Landing pages",
        "Opisy produktów",
        "Email marketing",
        "Reklamy",
      ],
      price: "od 20 zł",
    },
    {
      icon: MessageSquare,
      title: "Social media",
      examples: ["Posty Facebook", "Tweety", "LinkedIn", "Instagram"],
      price: "od 8 zł",
    },
    {
      icon: BookOpen,
      title: "Content marketing",
      examples: ["E-booki", "White papers", "Newslettery", "Webinary"],
      price: "od 80 zł",
    },
    {
      icon: Award,
      title: "Teksty korporacyjne",
      examples: ["O firmie", "Misja/wizja", "Raporty", "Prezentacje"],
      price: "od 50 zł",
    },
    {
      icon: Pen,
      title: "Content SEO",
      examples: ["Artykuły SEO", "Opisy kategorii", "FAQ", "Glossary"],
      price: "od 30 zł",
    },
  ];

  const comparisonData = [
    {
      feature: "Czas napisania 10-str artykułu",
      human: "8-12 godzin",
      ai: "5-10 minut",
      winner: "ai",
    },
    {
      feature: "Koszt 10-stronicowego artykułu",
      human: "500-800 zł",
      ai: "~40 zł",
      winner: "ai",
    },
    {
      feature: "Dostępność",
      human: "8h-18h (pn-pt)",
      ai: "24/7/365",
      winner: "ai",
    },
    {
      feature: "Wielojęzyczność",
      human: "Wymaga tłumacza",
      ai: "8 języków od ręki",
      winner: "ai",
    },
    {
      feature: "Rewizje i poprawki",
      human: "2-3 dni",
      ai: "Natychmiast",
      winner: "ai",
    },
    {
      feature: "Research źródeł",
      human: "2-4 godziny",
      ai: "Automatyczny",
      winner: "ai",
    },
  ];

  const testimonials = [
    {
      text: "AI copywriter Smart-Copy zastąpił mi agencję content marketingową. Oszczędzam 15,000 zł miesięcznie i dostaję teksty w ciągu minut zamiast tygodni.",
      author: "Marcin K.",
      role: "CEO, e-commerce",
      rating: 5,
    },
    {
      text: "Jako copywriter z 10-letnim doświadczeniem byłem sceptyczny. Ale ten AI pisarz tworzy lepsze first drafty niż połowa juniorów, z którymi pracowałem.",
      author: "Anna W.",
      role: "Senior Copywriter",
      rating: 5,
    },
    {
      text: "Copy AI pomógł nam skalować content z 4 artykułów miesięcznie do 50. To było niemożliwe z tradycyjnymi copywriterami przy naszym budżecie.",
      author: "Tomasz L.",
      role: "Marketing Manager",
      rating: 5,
    },
  ];

  const faq = [
    {
      question: "Czy AI copywriter zastąpi ludzkiego copywritera?",
      answer:
        "AI pisarz nie zastąpi kreatywnych seniorów, ale doskonale radzi sobie z content marketingiem, SEO, opisami produktów i artykułami blogowymi. To idealne narzędzie dla copywriterów - tworzy first draft, który później dopracowujesz.",
    },
    {
      question: "Jakie techniki copywritingu zna AI writer?",
      answer:
        "Nasz AI copywriter zna klasyczne technyki: AIDA (Attention, Interest, Desire, Action), PAS (Problem, Agitate, Solution), storytelling, call-to-action, power words, emotional triggers, benefit-driven writing i copywriting SEO.",
    },
    {
      question: "Czy copy AI pisze tylko po polsku?",
      answer:
        "Nie! AI writer tworzy teksty w 8 językach: polskim, angielskim, niemieckim, hiszpańskim, francuskim, włoskim, ukraińskim i rosyjskim. Każdy tekst brzmi jak napisany przez native speakera.",
    },
    {
      question: "Czy teksty AI copywritera są unikalne?",
      answer:
        "Tak! AI pisarz nigdy nie kopiuje treści ze źródeł. Analizuje informacje i tworzy w pełni oryginalny tekst własnymi słowami. Możesz sprawdzić unikalność w dowolnym plagiat checkerze - będzie 100%.",
    },
    {
      question: "Ile kosztuje AI copywriter vs tradycyjny copywriter?",
      answer:
        "Tradycyjny copywriter: 50-100 zł za 1000 znaków. AI copywriter Smart-Copy: 3.99 zł za 1000 znaków. To 12-25x tańsze! Artykuł 10-stronicowy: copywriter 500-800 zł, copy AI ~40 zł.",
    },
    {
      question: "Czy mogę edytować teksty wygenerowane przez AI writer?",
      answer:
        "Oczywiście! Po wygenerowaniu masz dostęp do edytora WYSIWYG - edytujesz tekst jak w Wordzie. Możesz dodać swoje przemyślenia, zmienić ton, poprawić szczegóły. AI copywriter to punkt startowy, nie końcowy.",
    },
  ];

  const useCaseSteps = [
    {
      step: 1,
      title: "Briefing w 60 sekund",
      description:
        "Podajesz temat, grupę docelową, ton komunikacji i długość. AI copywriter zrozumie zadanie.",
    },
    {
      step: 2,
      title: "AI pisarz zbiera materiały",
      description:
        "Automatyczny research w internecie + Twoje własne materiały źródłowe (opcjonalnie).",
    },
    {
      step: 3,
      title: "Copy AI pisze treść",
      description:
        "W 5-10 minut AI writer generuje gotowy, SEO-friendly tekst w wybranym stylu copywritingu.",
    },
    {
      step: 4,
      title: "Ty dopracowujesz szczegóły",
      description:
        "Edytujesz w WYSIWYG, dodajesz osobisty touch, eksportujesz PDF/DOCX.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          AI Copywriter | AI pisarz do tekstów sprzedażowych - Smart-Copy.ai
        </title>
        <meta
          name="description"
          content="AI copywriter Smart-Copy.ai - profesjonalny AI pisarz tworzący teksty sprzedażowe, artykuły i content marketing. Copy AI w 8 językach. 12x taniej niż tradycyjny copywriter. Od 3.99 zł/1000 znaków."
        />
        <meta
          name="keywords"
          content="AI copywriter, AI pisarz, AI writer, copy AI, sztuczna inteligencja copywriter, automatyczne pisanie tekstów, AI do copywritingu"
        />
        <link rel="canonical" href="https://smart-copy.ai/ai-copywriter" />
        <meta
          property="og:title"
          content="AI Copywriter | Profesjonalny AI pisarz - Smart-Copy.ai"
        />
        <meta
          property="og:description"
          content="AI copywriter tworzy teksty sprzedażowe 12x taniej niż człowiek. AI writer w 8 językach. Copywriting, content marketing, SEO."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smart-copy.ai/ai-copywriter" />
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 45, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 px-6 py-3 rounded-full mb-8 border border-indigo-200 dark:border-indigo-800"
              >
                <Pen className="w-5 h-5" />
                <span className="font-semibold">
                  Profesjonalny copywriting z AI
                </span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                AI copywriter
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  12x tańszy od człowieka
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto font-light">
                <strong className="font-semibold text-gray-900 dark:text-white">
                  AI pisarz
                </strong>{" "}
                do tekstów sprzedażowych, content marketingu i SEO.
                <br className="hidden md:block" />
                Copy AI w 8 językach - od 3.99 zł za 1000 znaków.
              </p>

              {/* Value props */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    5 minut vs 8 godzin pracy
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    40 zł vs 500-800 zł za artykuł
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    AIDA, PAS, storytelling
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="group btn btn-primary text-lg px-10 py-5 shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Testuj AI copywritera za darmo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <a
                  href="#porownanie"
                  className="btn btn-secondary text-lg px-10 py-5 border-2"
                >
                  Zobacz różnice
                </a>
              </div>

              {/* Trust signals */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✓ Bez zobowiązań ✓ Test za darmo ✓ 10,000+ zadowolonych
                użytkowników
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
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
                Dlaczego AI pisarz to przyszłość copywritingu?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Copy AI łączy szybkość maszyny z kreatywnością copywritera
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
                  className="group card dark:bg-gray-700 dark:border-gray-600 hover:shadow-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
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

        {/* How to Use */}
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
                Jak pracuje AI writer Smart-Copy?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Od briefu do gotowego tekstu w 4 prostych krokach
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {useCaseSteps.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connecting line */}
                  {index < useCaseSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-300 to-transparent dark:from-indigo-700 -ml-4" />
                  )}

                  <div className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all h-full relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
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

        {/* Copywriting Types */}
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
                Rodzaje tekstów od AI copywritera
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Copy AI pisze każdy typ treści marketingowej i sprzedażowej
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {copywritingTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                      {type.price}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {type.title}
                  </h3>

                  <ul className="space-y-2">
                    {type.examples.map((example, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section
          id="porownanie"
          className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
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
                Copywriter człowiek vs{" "}
                <span className="text-indigo-600">AI copywriter</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Porównanie kosztów, czasu i możliwości tradycyjnego copywritingu
                z AI pisarzem
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="font-bold text-lg">Porównanie</div>
                  <div className="font-bold text-lg text-center">
                    Copywriter człowiek
                  </div>
                  <div className="font-bold text-lg text-center">
                    AI copywriter
                  </div>
                </div>

                {/* Rows */}
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
                      {row.feature}
                    </div>
                    <div
                      className={`text-center ${
                        row.winner === "human"
                          ? "font-bold text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {row.human}
                    </div>
                    <div
                      className={`text-center ${
                        row.winner === "ai"
                          ? "font-bold text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {row.ai}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
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
                Co mówią użytkownicy AI pisarza?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Prawdziwe opinie o copy AI Smart-Copy.ai
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card dark:bg-gray-700 dark:border-gray-600"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Award
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
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
                Najczęstsze pytania o AI copywritera
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Wszystko co musisz wiedzieć o AI pisarzu i copy AI
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
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform">
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
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
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

          <div className="container-custom text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">
                  Ponad 10,000 copywriterów i marketerów już korzysta
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Wypróbuj AI copywritera
                <br />i przekonaj się sam
              </h2>

              <p className="text-xl md:text-2xl text-purple-100 mb-10 max-w-3xl mx-auto">
                AI pisarz Smart-Copy.ai to rewolucja w copywritingu. Copy AI
                tworzy profesjonalne teksty w minutach, nie w godzinach.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 transform"
                >
                  Testuj za darmo
                  <Rocket className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Zaloguj się
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <p className="text-purple-100">
                ✓ Bez karty kredytowej ✓ Test gratis ✓ Bez zobowiązań
              </p>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};
