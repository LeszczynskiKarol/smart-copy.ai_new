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
  Link as LinkIcon,
  Upload,
  X,
  Info,
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
    userSources: z
      .object({
        urls: z.array(z.string()),
        files: z.array(z.any()),
      })
      .optional(),
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

  // MODAL ŹRÓDEŁ
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

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
      userSources: { urls: [], files: [] },
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

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();

    // Usuń slash z końca
    normalized = normalized.replace(/\/$/, "");

    // Dodaj https:// jeśli brak protokołu
    if (
      !normalized.startsWith("http://") &&
      !normalized.startsWith("https://")
    ) {
      normalized = "https://" + normalized;
    }

    return normalized;
  };

  // Sprawdź czy URL już istnieje
  const isDuplicateUrl = (url: string): boolean => {
    return urls.some(
      (existing) => existing.toLowerCase() === url.toLowerCase()
    );
  };

  // Sprawdź czy plik już istnieje (po nazwie)
  const isDuplicateFile = (file: File): boolean => {
    return files.some((existing) => existing.name === file.name);
  };

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

  // DODAWANIE URL
  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    // ✅ Sprawdź limit
    if (urls.length + files.length >= 6) {
      toast.error("Maksymalnie 6 źródeł łącznie");
      return;
    }

    try {
      // ✅ Normalizuj URL
      const normalizedUrl = normalizeUrl(trimmedUrl);

      // ✅ Waliduj URL
      new URL(normalizedUrl);

      // ✅ Sprawdź duplikaty
      if (isDuplicateUrl(normalizedUrl)) {
        toast.error("Ten adres już został dodany");
        return;
      }

      setUrls([...urls, normalizedUrl]);
      setUrlInput("");
      toast.success("Link dodany");
    } catch {
      toast.error("Nieprawidłowy adres strony");
    }
  };

  // USUWANIE URL (z głównego formularza i modala)
  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);

    // Zaktualizuj formularz
    const currentSources = watch("userSources") || { urls: [], files: [] };
    setValue("userSources", { ...currentSources, urls: newUrls });

    toast.success("Link usunięty");
  };

  // DODAWANIE PLIKÓW
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // ✅ Sprawdź limit PRZED dodaniem
    const remainingSlots = 6 - urls.length - files.length;

    if (selectedFiles.length > remainingSlots) {
      toast.error(
        remainingSlots > 0
          ? `Możesz dodać maksymalnie ${remainingSlots} więcej ${
              remainingSlots === 1 ? "plik" : "plików"
            } (limit: 6 źródeł)`
          : "Osiągnięto limit 6 źródeł"
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles: File[] = [];
    const maxSize = 50 * 1024 * 1024; // 10MB

    for (const file of selectedFiles) {
      // ✅ Sprawdź duplikaty
      if (isDuplicateFile(file)) {
        toast.error(`${file.name}: Plik już został dodany`);
        continue;
      }

      // Sprawdź typ
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name}: Nieobsługiwany format (tylko PDF, DOC, DOCX)`
        );
        continue;
      }

      // Sprawdź rozmiar
      if (file.size > maxSize) {
        toast.error(`${file.name}: Plik zbyt duży (max 50MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      toast.success(
        `Dodano ${validFiles.length} ${
          validFiles.length === 1 ? "plik" : "plików"
        }`
      );
    }

    // Reset input
    e.target.value = "";
  };

  // USUWANIE PLIKÓW (z głównego formularza i modala)
  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    // Zaktualizuj formularz
    const currentSources = watch("userSources") || { urls: [], files: [] };
    setValue("userSources", { ...currentSources, files: newFiles });

    toast.success("Plik usunięty");
  };

  // ZATWIERDZENIE ŹRÓDEŁ (zamknięcie modala)
  const handleSaveUserSources = () => {
    setValue("userSources", { urls, files });
    setShowSourcesModal(false);

    const totalSources = urls.length + files.length;
    if (totalSources > 0) {
      toast.success(
        `Dodano ${totalSources} ${totalSources === 1 ? "źródło" : "źródeł"}`,
        {
          icon: "✅",
        }
      );
    }
  };

  // OTWARCIE MODALA - załaduj bieżące źródła
  const handleOpenSourcesModal = () => {
    const currentSources = watch("userSources");
    if (currentSources) {
      setUrls(currentSources.urls || []);
      setFiles(currentSources.files || []);
    }
    setShowSourcesModal(true);
  };

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
      userSources: { urls: [], files: [] },
    });
    // Reset źródeł
    setUrls([]);
    setFiles([]);
    toast.success("Tekst dodany do zamówienia");
  };

  const handleRemoveText = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
    toast.success("Tekst usunięty");
  };

  const handleSubmit = async () => {
    // W trybie MULTIPLE - jeśli są teksty, nie waliduj formularza
    if (mode === "multiple" && texts.length > 0) {
      // Użyj tylko dodanych tekstów bez walidacji formularza
      const orderTexts = texts;

      // ← ZAPISZ DRAFT PRZED SUBMITEM
      saveOrderDraft({
        mode: mode!,
        currentForm: watch(),
        texts: texts,
      });

      setIsSubmitting(true);

      try {
        // Przygotuj FormData dla plików
        const formData = new FormData();
        formData.append("textsData", JSON.stringify(orderTexts));

        // Dodaj pliki
        orderTexts.forEach((text, textIndex) => {
          text.userSources?.files?.forEach((file: File) => {
            formData.append(`text_${textIndex}_files`, file);
          });
        });

        await apiClient.post("/orders", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Sukces - wyczyść draft
        clearOrderDraft();
        toast.success("Zamówienie złożone pomyślnie!");
        reset();
        setTexts([]);
        setUrls([]);
        setFiles([]);
        setMode(null);
        onSuccess?.();
      } catch (error: any) {
        if (error.response?.status === 402) {
          const data = error.response.data;
          toast.error(data.message);
          if (data.stripeUrl) {
            window.location.href = data.stripeUrl;
          }
        } else {
          clearOrderDraft();
          const errorMessage =
            error.response?.data?.error || "Błąd podczas składania zamówienia";
          toast.error(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
      return; // <<<< EXIT
    }

    // W SINGLE lub MULTIPLE bez tekstów - waliduj formularz
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
      // Przygotuj FormData
      const formData = new FormData();
      formData.append("textsData", JSON.stringify(orderTexts));

      // Dodaj pliki
      orderTexts.forEach((text, textIndex) => {
        text.userSources?.files?.forEach((file: File) => {
          formData.append(`text_${textIndex}_files`, file);
        });
      });

      await apiClient.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Sukces - wyczyść draft
      clearOrderDraft();
      toast.success("Zamówienie złożone pomyślnie!");
      reset();
      setTexts([]);
      setUrls([]);
      setFiles([]);
      setMode(null);
      onSuccess?.();
    } catch (error: any) {
      if (error.response?.status === 402) {
        const data = error.response.data;
        toast.error(data.message);
        if (data.stripeUrl) {
          window.location.href = data.stripeUrl;
        }
      } else {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("single")}
            className="card hover:shadow-2xl transition-all p-8 bg-white dark:bg-gray-800 cursor-pointer border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 flex flex-col items-center text-center"
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
            className="card hover:shadow-2xl bg-white dark:bg-gray-800 transition-all p-8 cursor-pointer border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 flex flex-col items-center text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
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
            setUrls([]);
            setFiles([]);
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
                    {text.userSources &&
                      (text.userSources.urls.length > 0 ||
                        text.userSources.files.length > 0) && (
                        <>
                          {" "}
                          •{" "}
                          <span className="text-purple-600 dark:text-purple-400">
                            {text.userSources.urls.length +
                              text.userSources.files.length}{" "}
                            własnych źródeł
                          </span>
                        </>
                      )}
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

          {/* WŁASNE ŹRÓDŁA - NOWA SEKCJA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Dodaj własne źródła (opcjonalnie)
              </label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 bottom-6 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                  Smart-Copy uwzględni wskazane przez Ciebie strony lub
                  dokumenty jako materiały źródłowe, na podstawie których
                  napisze w pełni oryginalny tekst.
                  <br />
                  <br />
                  <strong>Maksymalnie 6 źródeł</strong> (linki + pliki).
                </div>
              </div>
            </div>

            {/* Przycisk dodawania */}
            <button
              type="button"
              onClick={handleOpenSourcesModal}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-4 h-4" />
              {urls.length + files.length > 0
                ? `Edytuj źródła (${urls.length + files.length}/6)`
                : "Dodaj źródła"}
            </button>

            {/* 🎯 PODGLĄD DODANYCH ŹRÓDEŁ W GŁÓWNYM FORMULARZU */}
            {(urls.length > 0 || files.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                {/* Linki */}
                {urls.map((url, index) => (
                  <motion.div
                    key={`url-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  >
                    <LinkIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-gray-700 dark:text-gray-300 truncate"
                        title={url}
                      >
                        {url}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(index)}
                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="Usuń link"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {/* Pliki */}
                {files.map((file, index) => (
                  <motion.div
                    key={`file-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                  >
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-gray-700 dark:text-gray-300 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="Usuń plik"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
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

      {/* MODAL ŹRÓDEŁ */}
      <AnimatePresence>
        {showSourcesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSourcesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dodaj własne źródła
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {urls.length + files.length}/6 źródeł
                  </p>
                </div>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* LINKI */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Linki do stron internetowych
                  </label>

                  {/* Input + button */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
                      placeholder="https://example.com/article"
                      disabled={urls.length + files.length >= 6}
                      className="input flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      disabled={urls.length + files.length >= 6}
                      className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Dodaj
                    </button>
                  </div>

                  {/* Lista URL */}
                  {urls.length > 0 && (
                    <div className="space-y-2">
                      {urls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          <LinkIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm text-gray-700 dark:text-gray-300 truncate"
                              title={url}
                            >
                              {url}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveUrl(index)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PLIKI */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Pliki dokumentów (PDF, DOC, DOCX)
                  </label>

                  {/* Upload button */}
                  <label
                    className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-all ${
                      urls.length + files.length >= 6
                        ? "border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                    }`}
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {urls.length + files.length >= 6
                        ? "Osiągnięto limit 6 źródeł"
                        : "Kliknij aby wybrać pliki"}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      disabled={urls.length + files.length >= 6}
                      className="hidden"
                    />
                  </label>

                  {/* Lista plików */}
                  {files.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                        >
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p>
                        <strong>Maksymalnie 6 źródeł łącznie</strong> (linki +
                        pliki).
                      </p>
                      <p>
                        Smart-Copy wykorzysta wskazane materiały jako podstawę
                        do napisania w pełni oryginalnego tekstu. Łączna długość
                        źródeł: do 200,000 znaków.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - buttons */}
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  type="button"
                  onClick={() => setShowSourcesModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserSources}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Zatwierdź ({urls.length + files.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
