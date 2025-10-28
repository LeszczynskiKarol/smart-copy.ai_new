// frontend/src/pages/HomePage.tsx

import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Sparkles, Zap, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const HomePage = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI najnowszej generacji",
      description:
        "Wykorzystujemy najnowsze modele językowe do generowania treści najwyższej jakości.",
    },
    {
      icon: Zap,
      title: "Błyskawiczna prędkość",
      description: "Twórz profesjonalne treści w sekundach, nie w godzinach.",
    },
    {
      icon: Shield,
      title: "Bezpieczeństwo danych",
      description:
        "Twoje dane są w pełni chronione i nigdy nie są udostępniane osobom trzecim.",
    },
    {
      icon: TrendingUp,
      title: "Zwiększ produktywność",
      description:
        "Oszczędzaj czas i skoncentruj się na tym, co najważniejsze.",
    },
  ];

  const useCases = [
    "Artykuły blogowe",
    "Opisy produktów",
    "Posty w mediach społecznościowych",
    "Treści marketingowe",
    "Treści SEO",
    "Newslettery",
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container-custom py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Twórz treści, które{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                sprzedają
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Generuj profesjonalne treści w kilka sekund dzięki sztucznej
              inteligencji. Oszczędzaj czas i zwiększaj konwersje.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Rozpocznij za darmo
              </Link>
              <Link
                to="/#features"
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Zobacz możliwości
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              ✓ Bez karty kredytowej ✓ 14 dni darmowego okresu próbnego
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Dlaczego Smart-Copy.ai?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Wszystko, czego potrzebujesz do tworzenia profesjonalnych treści
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card dark:bg-gray-700 dark:border-gray-600 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Nieograniczone możliwości
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Twórz każdy rodzaj treści, jakiego potrzebujesz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-transparent dark:border-gray-700"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {useCase}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gotowy na rewolucję w tworzeniu treści?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych użytkowników już dziś
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Zacznij za darmo
          </Link>
        </div>
      </section>
    </Layout>
  );
};
