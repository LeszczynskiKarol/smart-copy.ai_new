// frontend/src/components/orders/ProgressBar.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle,
  Eye,
  Sparkles,
  Clock,
  Timer,
  Zap,
  Brain,
  Rocket,
} from "lucide-react";

interface ProgressBarProps {
  progress: string | null | undefined;
  textLength: number;
  startTime?: string;
}

const STAGES = [
  {
    id: "query",
    label: "Tworzenie zapytania do Google",
    icon: Clock,
    duration: 5,
  },
  { id: "search", label: "Wyszukiwanie źródeł", icon: Search, duration: 10 },
  {
    id: "scraping-all",
    label: "Pobieranie treści źródeł",
    icon: Eye,
    duration: 10,
  },
  {
    id: "selecting",
    label: "Wybór najlepszych źródeł",
    icon: CheckCircle,
    duration: 5,
  },
  { id: "writing", label: "Tworzenie treści", icon: Sparkles, duration: 0 },
];

// 🎯 LOSOWE TIPY PODCZAS ŁADOWANIA
const LOADING_TIPS = [
  "🤖 Inicjalizuję model Claude Sonnet 4...",
  "🔍 Przygotowuję silnik wyszukiwania...",
  "📚 Ładuję bazę wiedzy AI...",
  "⚡ Optymalizuję parametry generowania...",
  "🎯 Analizuję strukturę treści...",
  "🌍 Konfiguruję wielojęzyczny model...",
  "💡 Przygotowuję kreatywne algorytmy...",
  "🚀 Uruchamiam proces generowania...",
  "✨ Rozgrzewam neurony AI...",
  "🔬 Kalibruję parametry jakości...",
];

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} sek.`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} min. ${remainingSeconds} sek.`
      : `${minutes} min.`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours} godz. ${remainingMinutes} min.`
    : `${hours} godz.`;
}

function calculateTotalDuration(textLength: number): number {
  const writingTime = Math.ceil((textLength / 1500) * 60);
  const totalFixedTime = STAGES.slice(0, 4).reduce(
    (sum, stage) => sum + stage.duration,
    0
  );
  return totalFixedTime + writingTime;
}

function calculateRemainingTime(
  progress: string | null | undefined,
  textLength: number,
  startTime?: string
): number {
  if (!progress || progress === "completed") return 0;
  const totalDuration = calculateTotalDuration(textLength);

  let normalizedProgress = progress;
  if (progress === "reading") normalizedProgress = "scraping-all";
  if (progress === "select") normalizedProgress = "selecting";

  const currentIndex = STAGES.findIndex((s) => s.id === normalizedProgress);
  if (currentIndex === -1) return totalDuration;

  if (startTime) {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const actualElapsed = Math.floor((now - start) / 1000);
    return Math.max(0, totalDuration - actualElapsed);
  }

  let elapsedTime = 0;
  for (let i = 0; i < currentIndex; i++) {
    if (i === 4) {
      elapsedTime += Math.ceil((textLength / 1500) * 60);
    } else {
      elapsedTime += STAGES[i].duration;
    }
  }
  return Math.max(0, totalDuration - elapsedTime);
}

function calculateProgress(
  currentStageIndex: number,
  textLength: number,
  startTime?: string
): number {
  if (currentStageIndex === -1) return 0;

  const totalDuration = calculateTotalDuration(textLength);

  if (startTime) {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const actualElapsed = Math.floor((now - start) / 1000);
    const rawProgress = (actualElapsed / totalDuration) * 100;
    return Math.min(98, rawProgress);
  }

  let elapsedTime = 0;
  for (let i = 0; i <= currentStageIndex; i++) {
    if (i === 4) {
      elapsedTime += Math.ceil((textLength / 1500) * 60);
    } else {
      elapsedTime += STAGES[i].duration;
    }
  }

  const rawProgress = (elapsedTime / totalDuration) * 100;
  return Math.min(98, rawProgress);
}

// 🎨 KOMPONENT LOADING PRZED STARTEM
const InitializingLoader = ({ textLength }: { textLength: number }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 1.5;
      });
    }, 150);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden"
    >
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 25%, rgba(147, 51, 234, 0.1) 25%, rgba(147, 51, 234, 0.1) 50%, transparent 50%, transparent 75%, rgba(147, 51, 234, 0.1) 75%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="w-6 h-6 text-yellow-500" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Przygotowuję generator AI...
        </h3>

        <div className="h-6 mb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTip}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-sm text-purple-600 dark:text-purple-400 font-medium"
            >
              {LOADING_TIPS[currentTip]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden mb-4 shadow-inner">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>📝 {textLength.toLocaleString()} znaków</span>
          <span>•</span>
          <span>⏱️ Start za moment...</span>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const ProgressBar = ({
  progress,
  textLength,
  startTime,
}: ProgressBarProps) => {
  // ✅ WSZYSTKIE HOOKI NA POCZĄTKU - PRZED JAKIMKOLWIEK RETURN!
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [finalBoxVisible, setFinalBoxVisible] = useState(false);

  // Normalizacja progress
  const normalizedProgress = useMemo(() => {
    if (!progress) return null;
    if (progress === "reading") return "scraping-all";
    if (progress === "select") return "selecting";
    return progress;
  }, [progress]);

  const currentIndex = useMemo(() => {
    if (!normalizedProgress) return -1;
    return STAGES.findIndex((s) => s.id === normalizedProgress);
  }, [normalizedProgress]);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingTime(normalizedProgress, textLength, startTime)
  );

  const [progressPercent, setProgressPercent] = useState(() =>
    calculateProgress(currentIndex, textLength, startTime)
  );

  // ✅ HOOK DLA COMPLETED - ZAWSZE WYWOŁYWANY
  useEffect(() => {
    if (progress === "completed" && !showCompletionAnimation) {
      setShowCompletionAnimation(true);

      const timer = setTimeout(() => {
        setFinalBoxVisible(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [progress, showCompletionAnimation]);

  // ✅ HOOK DLA PROGRESS UPDATE - ZAWSZE WYWOŁYWANY
  useEffect(() => {
    // Nie aktualizuj jeśli brak progress lub completed
    if (!normalizedProgress || normalizedProgress === "completed") return;

    const interval = setInterval(() => {
      const newRemaining = calculateRemainingTime(
        normalizedProgress,
        textLength,
        startTime
      );
      const newProgress = calculateProgress(
        currentIndex,
        textLength,
        startTime
      );

      setRemainingSeconds(newRemaining > 0 ? newRemaining : 0);
      setProgressPercent(newProgress);
    }, 1000);

    return () => clearInterval(interval);
  }, [normalizedProgress, textLength, startTime, currentIndex]);

  // ✅ TERAZ EARLY RETURNS - PO WSZYSTKICH HOOKACH!

  // 🎯 JEŚLI BRAK PROGRESS - POKAŻ INITIALIZING LOADER
  if (!progress) {
    return <InitializingLoader textLength={textLength} />;
  }

  // ✅ JEŚLI COMPLETED - POKAŻ ANIMACJĘ LUB FINALNY BOX
  if (progress === "completed") {
    // FAZA 1: Animacja zapełniania (0-4s)
    if (!finalBoxVisible) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mt-4 p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-lg border-2 border-green-300 dark:border-green-700 relative overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(45deg, transparent 25%, rgba(34, 197, 94, 0.2) 25%, rgba(34, 197, 94, 0.2) 50%, transparent 50%, transparent 75%, rgba(34, 197, 94, 0.2) 75%)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                </motion.div>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  Finalizacja generowania...
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-bold text-green-700 dark:text-green-300"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  98%
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {" "}
                  → 100%
                </motion.span>
              </motion.span>
            </div>

            <div className="h-3 bg-green-100 dark:bg-green-900/40 rounded-full overflow-hidden mb-4 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative"
                initial={{ width: "98%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-bold">
                  🎉 Twój tekst jest gotowy!
                </span>
                <CheckCircle className="w-6 h-6" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-sm text-green-600 dark:text-green-400 mt-2"
              >
                Generowanie zakończone pomyślnie ✨
              </motion.p>
            </motion.div>

            <div className="flex justify-center gap-3 mt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-green-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    // FAZA 2: Finalny zielony box (po 4s)
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="final-box"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </motion.div>
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm font-bold text-green-700 dark:text-green-300"
              >
                ✅ Tekst ukończony!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xs text-green-600 dark:text-green-400 mt-1"
              >
                Będzie dostępny po zakończeniu całego zamówienia
              </motion.p>
            </div>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles className="w-5 h-5 text-green-500" />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ✅ NORMALNY PROGRESS (dla IN_PROGRESS)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Postęp generowania
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {Math.round(progressPercent)}%
          </span>
          {remainingSeconds > 0 && (
            <div className="flex items-center gap-1 text-sm font-bold text-purple-700 dark:text-purple-300">
              <Timer className="w-4 h-4" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          )}
          {progressPercent >= 98 && (
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">
              Finalizacja...
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${progressPercent}%` }}
          transition={{
            duration: 1,
            ease: "linear",
          }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/40"
                  : isCompleted
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "opacity-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? "bg-blue-500 text-white animate-pulse"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-500 ${
                  isActive
                    ? "text-blue-700 dark:text-blue-300"
                    : isCompleted
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {stage.label}
                {isActive && (
                  <span className="ml-2 inline-flex items-center">
                    <span className="animate-bounce">⚡</span>
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Info o czasie pisania */}
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          📝 Tekst: {textLength.toLocaleString()} znaków • Szacowany czas:{" "}
          {formatTime(calculateTotalDuration(textLength))}
        </p>
      </div>
    </motion.div>
  );
};
