// frontend/src/components/orders/OrderForm.tsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Calculator,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { TEXT_TYPES, LANGUAGES, type LengthUnit } from "@/types/order";

const ORDER_DRAFT_KEY = "smart-copy-order-draft";

// Helper do zapisywania
const saveOrderDraft = (data: {
  mode: "single" | "multiple";
  currentForm: any;
  texts: any[];
}) => {
  try {
    localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
};

// Helper do czyszczenia
const clearOrderDraft = () => {
  try {
    localStorage.removeItem(ORDER_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
};

// SCHEMA Z LEPSZĄ WALIDACJĄ
const textSchema = z
  .object({
    topic: z.string().min(3, "Temat musi mieć minimum 3 znaki"),
    length: z.number().min(1, "Długość musi być większa od 0"),
    lengthUnit: z.enum(["PAGES", "CHARACTERS"]),
    language: z.string().min(1, "Wybierz język"),
    textType: z.string().optional(),
    customType: z.string().optional(),
    guidelines: z.string().optional(),
  })
  .refine(
    (data) => {
      // Sprawdź minimum dla znaków
      if (data.lengthUnit === "CHARACTERS" && data.length < 2000) {
        return false;
      }
      return true;
    },
    {
      message: "Minimalna liczba znaków to 2000",
      path: ["length"],
    }
  );

type TextFormValues = z.infer<typeof textSchema>;

export const OrderForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<"single" | "multiple" | null>(null);
  const [texts, setTexts] = useState<TextFormValues[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<TextFormValues>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      topic: "",
      length: 1,
      lengthUnit: "PAGES",
      language: "pl",
      textType: "",
      customType: "",
      guidelines: "",
    },
  });

  // ← DODAJ TEN useEffect NA SAMYM POCZĄTKU:
  useEffect(() => {
    // Sprawdź czy mamy draft w localStorage
    const draft = localStorage.getItem(ORDER_DRAFT_KEY);

    if (draft) {
      // ← DODAJ: Sprawdź URL - jeśli SUCCESS, nie przywracaj drafta!
      const urlParams = new URLSearchParams(window.location.search);
      const payment = urlParams.get("payment");

      // Jeśli płatność sukces - wyczyść draft i NIE przywracaj
      if (payment === "success") {
        clearOrderDraft();
        return; // ← EXIT
      }

      // Tylko dla CANCELLED przywracamy draft
      if (payment === "cancelled") {
        try {
          const parsedDraft = JSON.parse(draft);

          // Przywróć mode
          if (parsedDraft.mode) {
            setMode(parsedDraft.mode);
          }

          // Przywróć texts
          if (parsedDraft.texts) {
            setTexts(parsedDraft.texts);
          }

          // Przywróć formularz
          if (parsedDraft.currentForm) {
            reset(parsedDraft.currentForm);
          }

          // Pokaż toast
          toast.error("Płatność anulowana. Przywrócono formularz zamówienia.", {
            duration: 5000,
          });

          // Wyczyść draft
          clearOrderDraft();

          // Wyczyść URL params
          setSearchParams({});
        } catch (error) {
          console.error("Failed to restore draft:", error);
          clearOrderDraft(); // Wyczyść zepsuty draft
        }
      }
    }
  }, []); // Tylko raz na mount

  const watchedLength = watch("length", 1);
  const watchedUnit = watch("lengthUnit", "PAGES");
  const watchedTextType = watch("textType", "");

  // KONWERSJA PRZY ZMIANIE JEDNOSTKI
  const handleUnitChange = (newUnit: LengthUnit) => {
    const currentLength = watchedLength;
    const currentUnit = watchedUnit;

    if (currentUnit === newUnit) return;

    let newLength;
    if (newUnit === "PAGES") {
      // Z znaków na strony
      newLength = Math.max(1, Math.ceil(currentLength / 2000));
    } else {
      // Ze stron na znaki
      newLength = Math.max(2000, currentLength * 2000);
    }

    setValue("length", newLength);
    setValue("lengthUnit", newUnit);
  };

  // Live calculation
  const calculateCharacters = (length: number, unit: LengthUnit): number => {
    return unit === "PAGES" ? length * 2000 : length;
  };

  const calculatePages = (length: number, unit: LengthUnit): number => {
    return unit === "PAGES" ? length : Math.ceil(length / 2000);
  };

  const calculatePrice = (characters: number): number => {
    return (characters / 1000) * 3.99;
  };

  const characters = calculateCharacters(watchedLength, watchedUnit);
  const pages = calculatePages(watchedLength, watchedUnit);
  const currentPrice = calculatePrice(characters);

  const totalTexts = mode === "multiple" ? texts.length : 1;
  const totalPrice =
    mode === "multiple"
      ? texts.reduce((sum, text) => {
          const chars = calculateCharacters(text.length, text.lengthUnit);
          return sum + calculatePrice(chars);
        }, 0)
      : currentPrice;

  const handleAddText = async () => {
    const data = watch();

    // WALIDACJA Z POKAZYWANIEM BŁĘDÓW
    const isValid = await trigger();
    if (!isValid) {
      // Pokaż pierwszy błąd
      if (errors.topic) {
        toast.error(errors.topic.message || "Podaj temat");
      } else if (errors.length) {
        toast.error(errors.length.message || "Nieprawidłowa długość");
      } else if (errors.language) {
        toast.error(errors.language.message || "Wybierz język");
      } else {
        toast.error("Uzupełnij wszystkie wymagane pola");
      }
      return;
    }

    setTexts([...texts, data]);
    reset({
      topic: "",
      length: 1,
      lengthUnit: "PAGES",
      language: "pl",
      textType: "",
      customType: "",
      guidelines: "",
    });
    toast.success("Tekst dodany do zamówienia");
  };

  const handleRemoveText = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
    toast.success("Tekst usunięty");
  };

  const handleSubmit = async () => {
    const data = watch();

    const isValid = await trigger();
    if (!isValid) {
      if (errors.topic) {
        toast.error(errors.topic.message || "Podaj temat");
      } else if (errors.length) {
        toast.error(errors.length.message || "Nieprawidłowa długość");
      } else if (errors.language) {
        toast.error(errors.language.message || "Wybierz język");
      } else {
        toast.error("Uzupełnij wszystkie wymagane pola");
      }
      return;
    }

    const orderTexts = mode === "multiple" ? texts : [data];

    if (orderTexts.length === 0) {
      toast.error("Dodaj przynajmniej jeden tekst");
      return;
    }

    // ← ZAPISZ DRAFT PRZED SUBMITEM
    saveOrderDraft({
      mode: mode!,
      currentForm: data,
      texts: texts,
    });

    setIsSubmitting(true);

    try {
      await apiClient.post("/orders", {
        texts: orderTexts.map((text) => ({
          ...text,
          textType: text.textType || "OTHER",
          customType: text.textType === "OTHER" ? text.customType : undefined,
        })),
      });

      // Sukces - wyczyść draft
      clearOrderDraft();
      toast.success("Zamówienie złożone pomyślnie!");
      reset();
      setTexts([]);
      setMode(null);
      onSuccess?.();
    } catch (error: any) {
      if (error.response?.status === 402) {
        const data = error.response.data;
        toast.error(data.message);

        // Przekieruj do Stripe - draft już zapisany
        if (data.stripeUrl) {
          window.location.href = data.stripeUrl;
        }
      } else {
        // Inny błąd - wyczyść draft
        clearOrderDraft();
        const errorMessage =
          error.response?.data?.error || "Błąd podczas składania zamówienia";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Złóż zamówienie na treści AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Wybierz, ile tekstów chcesz zamówić
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("single")}
            className="card hover:shadow-2xl transition-all p-8 bg-white dark:bg-gray-800 cursor-pointer border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400"
          >
            <FileText className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Jeden tekst
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Idealne dla pojedynczego artykułu, raportu lub innej treści
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("multiple")}
            className="card hover:shadow-2xl bg-white dark:bg-gray-800 transition-all p-8 cursor-pointer border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Wiele tekstów
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Zamów kilka różnych tekstów w jednym zamówieniu
            </p>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === "single" ? "Zamów jeden tekst" : "Zamów wiele tekstów"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Uzupełnij szczegóły swojego zamówienia
          </p>
        </div>
        <button
          onClick={() => {
            setMode(null);
            setTexts([]);
            reset();
          }}
          className="btn btn-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          Zmień tryb
        </button>
      </div>

      {/* Lista dodanych tekstów (multi mode) */}
      {mode === "multiple" && texts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card dark:bg-gray-800 dark:border-gray-700 mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Dodane teksty ({texts.length})
          </h3>
          <div className="space-y-3">
            {texts.map((text, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {text.topic}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {calculatePages(text.length, text.lengthUnit)} str. •{" "}
                    {calculateCharacters(
                      text.length,
                      text.lengthUnit
                    ).toLocaleString()}{" "}
                    znaków •{" "}
                    {LANGUAGES.find((l) => l.value === text.language)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {calculatePrice(
                      calculateCharacters(text.length, text.lengthUnit)
                    ).toFixed(2)}{" "}
                    zł
                  </span>
                  <button
                    onClick={() => handleRemoveText(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Formularz */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temat */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Temat tekstu *
            </label>
            <input
              {...register("topic")}
              type="text"
              placeholder="np. Jak AI zmienia marketing w 2025 roku"
              className={`input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.topic ? "border-red-500" : ""
              }`}
            />
            {errors.topic && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.topic.message}
              </p>
            )}
          </motion.div>

          {/* Długość */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Długość tekstu *
            </label>

            {/* Toggle jednostki Z AUTOMATYCZNĄ KONWERSJĄ */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleUnitChange("PAGES")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  watchedUnit === "PAGES"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Strony
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange("CHARACTERS")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  watchedUnit === "CHARACTERS"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Znaki
              </button>
            </div>

            <input
              {...register("length", { valueAsNumber: true })}
              type="number"
              min={watchedUnit === "PAGES" ? 1 : 2000}
              step={watchedUnit === "PAGES" ? 1 : 1000}
              className={`input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 ${
                errors.length ? "border-red-500" : ""
              }`}
            />

            {errors.length && (
              <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.length.message}
              </p>
            )}

            {/* Live conversion */}
            <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div className="text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  To jest około:{" "}
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {watchedUnit === "PAGES"
                    ? `${characters.toLocaleString()} znaków`
                    : `${pages} ${
                        pages === 1 ? "strona" : pages < 5 ? "strony" : "stron"
                      }`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Język */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 ">
              Język tekstu *
            </label>
            <select
              {...register("language")}
              className="input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Rodzaj tekstu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 ">
              Rodzaj tekstu (opcjonalnie)
            </label>
            <select
              {...register("textType")}
              className="input w-full mb-3 bg-white dark:bg-gray-800"
            >
              <option value="">Wybierz rodzaj</option>
              {Object.entries(TEXT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Custom type field */}
            <AnimatePresence>
              {watchedTextType === "OTHER" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  {...register("customType")}
                  type="text"
                  placeholder="Wpisz własny rodzaj tekstu"
                  className="input w-full"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Wytyczne */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Dodatkowe wytyczne (opcjonalnie)
            </label>
            <textarea
              {...register("guidelines")}
              rows={4}
              placeholder="Opisz szczegóły, ton komunikacji, grupy docelowe, słowa kluczowe..."
              className="input w-full resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </motion.div>
        </div>

        {/* Right - Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card dark:bg-gray-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Podsumowanie
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Liczba tekstów:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalTexts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Aktualna długość:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pages} str.
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Znaki:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {characters.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Cena za 1000 znaków:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    3.99 zł
                  </span>
                </div>
              </div>

              <div className="border-t border-purple-200 dark:border-purple-800 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Suma:
                  </span>
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {totalPrice.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {mode === "multiple" && (
                <button
                  type="button"
                  onClick={handleAddText}
                  className="btn btn-secondary w-full mb-3 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj tekst
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Przetwarzanie..."
                ) : (
                  <>
                    Złóż zamówienie
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Po złożeniu zamówienia skontaktujemy się z Tobą w ciągu 24h
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
