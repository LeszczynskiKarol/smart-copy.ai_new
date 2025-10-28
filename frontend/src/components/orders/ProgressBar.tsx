// frontend/src/components/orders/ProgressBar.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, Eye, Sparkles, Clock, Timer } from "lucide-react";

interface ProgressBarProps {
  progress: string | null | undefined;
  textLength: number;
  startTime?: string;
}

const STAGES = [
  { id: "query", label: "Tworzenie zapytania", icon: Clock, duration: 5 }, // 10s → 5s
  { id: "search", label: "Wyszukiwanie źródeł", icon: Search, duration: 10 }, // 15s → 10s
  { id: "select", label: "Wybór źródeł", icon: CheckCircle, duration: 5 }, // 10s → 5s
  {
    id: "reading",
    label: "Zapoznawanie się ze źródłami",
    icon: Eye,
    duration: 10,
  }, // 20s → 10s
  { id: "writing", label: "Tworzenie treści", icon: Sparkles, duration: 0 }, // dynamiczne
];

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sek.`;
  }
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
  // 60 sekund na 1500 znaków
  const writingTime = Math.ceil((textLength / 1500) * 60);

  // Początkowe etapy: tylko 30s łącznie (query + search + select + reading)
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
  const currentIndex = STAGES.findIndex((s) => s.id === progress);

  if (currentIndex === -1) return totalDuration;

  // Jeśli mamy startTime, używamy rzeczywistego czasu
  if (startTime) {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const actualElapsed = Math.floor((now - start) / 1000);

    return Math.max(0, totalDuration - actualElapsed);
  }

  // Oblicz ile czasu już minęło (teoretycznie)
  let elapsedTime = 0;
  for (let i = 0; i < currentIndex; i++) {
    if (i === 4) {
      // Etap writing
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

  // Jeśli mamy startTime, użyj rzeczywistego czasu do obliczenia progress
  if (startTime) {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const actualElapsed = Math.floor((now - start) / 1000);

    return Math.min(100, (actualElapsed / totalDuration) * 100);
  }

  // Oblicz progress bazując na etapie
  let elapsedTime = 0;
  for (let i = 0; i <= currentStageIndex; i++) {
    if (i === 4) {
      elapsedTime += Math.ceil((textLength / 1500) * 60);
    } else {
      elapsedTime += STAGES[i].duration;
    }
  }

  return Math.min(100, (elapsedTime / totalDuration) * 100);
}

export const ProgressBar = ({
  progress,
  textLength,
  startTime,
}: ProgressBarProps) => {
  if (!progress || progress === "completed") return null;

  const currentIndex = STAGES.findIndex((s) => s.id === progress);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingTime(progress, textLength, startTime)
  );

  const [progressPercent, setProgressPercent] = useState(() =>
    calculateProgress(currentIndex, textLength, startTime)
  );

  // Odliczanie w czasie rzeczywistym
  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = calculateRemainingTime(
        progress,
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
  }, [progress, textLength, startTime, currentIndex]);

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Postęp generowania
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {Math.round(progressPercent)}%
          </span>
          <div className="flex items-center gap-1 text-sm font-bold text-purple-700 dark:text-purple-300">
            <Timer className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar - PŁYNNY */}
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
    </div>
  );
};
