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
  AlertCircle,
  Link as LinkIcon,
  Upload,
  X,
  ChevronDown,
  Shield,
  Info,
  Package,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import {
  TEXT_TYPES,
  LANGUAGES,
  type LengthUnit,
  type SeoLink,
  calculateMaxLinks,
} from "@/types/order";

const ORDER_DRAFT_KEY = "smart-copy-order-draft";
const MAX_TEXTS_PER_ORDER = 50; // ← NOWY LIMIT

const saveOrderDraft = (data: { currentForm: any; texts: any[] }) => {
  try {
    localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
};

const clearOrderDraft = () => {
  try {
    localStorage.removeItem(ORDER_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
};

const textSchema = z
  .object({
    topic: z.string().min(3, "Temat musi mieć minimum 3 znaki"),
    length: z.number().min(1, "Długość musi być większa od 0"),
    lengthUnit: z.enum(["PAGES", "CHARACTERS"]),
    language: z.string().min(1, "Wybierz język"),
    textType: z.string().optional(),
    customType: z.string().optional(),
    guidelines: z.string().optional(),
    seoData: z
      .object({
        keywords: z.array(z.string()),
        links: z.array(
          z.object({
            url: z.string(),
            anchor: z.string(),
          })
        ),
      })
      .optional(),
    userSources: z
      .object({
        urls: z.array(z.string()),
        files: z.array(z.any()),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.lengthUnit === "CHARACTERS" && data.length < 2000) {
        return false;
      }
      // ✅ NOWY LIMIT: MAX 300,000 znaków
      if (data.lengthUnit === "CHARACTERS" && data.length > 300000) {
        return false;
      }
      // ✅ NOWY LIMIT: MAX 150 stron
      if (data.lengthUnit === "PAGES" && data.length > 150) {
        return false;
      }
      return true;
    },
    (data) => {
      if (data.lengthUnit === "CHARACTERS") {
        if (data.length < 2000) {
          return {
            message: "Minimalna liczba znaków to 2000",
            path: ["length"],
          };
        }
        if (data.length > 300000) {
          return {
            message: "Maksymalna liczba znaków to 300,000",
            path: ["length"],
          };
        }
      }
      if (data.lengthUnit === "PAGES" && data.length > 150) {
        return {
          message: "Maksymalna liczba stron to 150",
          path: ["length"],
        };
      }
      return { message: "", path: [] };
    }
  );

type TextFormValues = z.infer<typeof textSchema>;

export const OrderForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [, setSearchParams] = useSearchParams();
  const [texts, setTexts] = useState<TextFormValues[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [noRefundConsent, setNoRefundConsent] = useState(false);
  const [showLegalInfo, setShowLegalInfo] = useState(false);
  // MODAL ŹRÓDEŁ
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // SEO
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoLinks, setSeoLinks] = useState<SeoLink[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkAnchor, setLinkAnchor] = useState("");

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
      seoData: { keywords: [], links: [] },
    },
  });

  // PRZYWRACANIE DRAFTU
  useEffect(() => {
    const draft = localStorage.getItem(ORDER_DRAFT_KEY);
    if (draft) {
      const urlParams = new URLSearchParams(window.location.search);
      const payment = urlParams.get("payment");

      if (payment === "success") {
        clearOrderDraft();
        return;
      }

      if (payment === "cancelled") {
        try {
          const parsedDraft = JSON.parse(draft);
          if (parsedDraft.texts) {
            setTexts(parsedDraft.texts);
          }
          if (parsedDraft.currentForm) {
            reset(parsedDraft.currentForm);
          }
          toast.error("Płatność anulowana. Przywrócono formularz zamówienia.", {
            duration: 5000,
          });
          clearOrderDraft();
          setSearchParams({});
        } catch (error) {
          console.error("Failed to restore draft:", error);
          clearOrderDraft();
        }
      }
    }
  }, []);

  const watchedTopic = watch("topic", "");
  const watchedLength = watch("length", 1);
  const watchedUnit = watch("lengthUnit", "PAGES");
  const watchedTextType = watch("textType", "");
  // ✅ OBLICZ LIMIT LINKÓW
  const maxLinks = calculateMaxLinks(watchedLength, watchedUnit);
  const canAddMoreLinks = seoLinks.length < maxLinks;

  // ✅ SPRAWDŹ CZY FORMULARZ WYPEŁNIONY (min 3 znaki w temacie)
  const isFormFilled = watchedTopic && watchedTopic.trim().length >= 3;

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim().replace(/\/$/, "");
    if (
      !normalized.startsWith("http://") &&
      !normalized.startsWith("https://")
    ) {
      normalized = "https://" + normalized;
    }
    return normalized;
  };

  const handleAddKeyword = () => {
    const trimmed = seoKeywordInput.trim();
    if (!trimmed) return;

    if (seoKeywords.includes(trimmed.toLowerCase())) {
      toast.error("Ta fraza już została dodana");
      return;
    }

    if (seoKeywords.length >= 10) {
      toast.error("Maksymalnie 10 fraz kluczowych");
      return;
    }

    setSeoKeywords([...seoKeywords, trimmed]);
    setSeoKeywordInput("");
    toast.success("Fraza dodana");
  };

  const handleRemoveKeyword = (index: number) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== index));
    toast.success("Fraza usunięta");
  };

  const normalizeLinkUrl = (url: string): string => {
    let normalized = url.trim();

    // ✅ Usuń trailing slash
    normalized = normalized.replace(/\/+$/, "");

    // ✅ Dodaj https:// jeśli brak protokołu
    if (
      !normalized.startsWith("http://") &&
      !normalized.startsWith("https://")
    ) {
      normalized = "https://" + normalized;
    }

    return normalized;
  };

  const handleAddLink = () => {
    const trimmedUrl = linkUrl.trim();
    const trimmedAnchor = linkAnchor.trim();

    if (!trimmedUrl || !trimmedAnchor) {
      toast.error("Podaj URL i anchor");
      return;
    }

    // ✅ UŻYJ NORMALIZACJI
    const normalizedUrl = normalizeLinkUrl(trimmedUrl);

    try {
      new URL(normalizedUrl);
    } catch {
      toast.error("Nieprawidłowy URL");
      return;
    }

    if (!canAddMoreLinks) {
      toast.error(`Maksymalnie ${maxLinks} linków dla tej długości tekstu`);
      return;
    }

    // ✅ ZAPISZ ZNORMALIZOWANY URL
    setSeoLinks([...seoLinks, { url: normalizedUrl, anchor: trimmedAnchor }]);
    setLinkUrl("");
    setLinkAnchor("");
    toast.success("Link dodany");
  };

  const handleRemoveLink = (index: number) => {
    setSeoLinks(seoLinks.filter((_, i) => i !== index));
    toast.success("Link usunięty");
  };

  const isDuplicateUrl = (url: string): boolean => {
    return urls.some(
      (existing) => existing.toLowerCase() === url.toLowerCase()
    );
  };

  const isDuplicateFile = (file: File): boolean => {
    return files.some((existing) => existing.name === file.name);
  };

  const handleUnitChange = (newUnit: LengthUnit) => {
    const currentLength = watchedLength;
    const currentUnit = watchedUnit;
    if (currentUnit === newUnit) return;

    let newLength;
    if (newUnit === "PAGES") {
      newLength = Math.max(1, Math.ceil(currentLength / 2000));
    } else {
      newLength = Math.max(2000, currentLength * 2000);
    }

    setValue("length", newLength);
    setValue("lengthUnit", newUnit);
  };

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

  // ✅ SUMA TEKSTÓW NA LIŚCIE
  const totalTextsPrice = texts.reduce((sum, text) => {
    const chars = calculateCharacters(text.length, text.lengthUnit);
    return sum + calculatePrice(chars);
  }, 0);

  // ✅ SUMA CAŁKOWITA - dodaj currentPrice TYLKO jeśli formularz wypełniony
  const totalPrice = totalTextsPrice + (isFormFilled ? currentPrice : 0);

  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    if (urls.length + files.length >= 6) {
      toast.error("Maksymalnie 6 źródeł łącznie");
      return;
    }

    try {
      const normalizedUrl = normalizeUrl(trimmedUrl);
      new URL(normalizedUrl);

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

  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    const currentSources = watch("userSources") || { urls: [], files: [] };
    setValue("userSources", { ...currentSources, urls: newUrls });
    toast.success("Link usunięty");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remainingSlots = 6 - urls.length - files.length;

    if (selectedFiles.length > remainingSlots) {
      toast.error(
        remainingSlots > 0
          ? `Możesz dodać maksymalnie ${remainingSlots} więcej ${
              remainingSlots === 1 ? "plik" : "plików"
            }`
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
    const maxSize = 50 * 1024 * 1024;

    for (const file of selectedFiles) {
      if (isDuplicateFile(file)) {
        toast.error(`${file.name}: Plik już został dodany`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name}: Nieobsługiwany format (tylko PDF, DOC, DOCX)`
        );
        continue;
      }
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

    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const currentSources = watch("userSources") || { urls: [], files: [] };
    setValue("userSources", { ...currentSources, files: newFiles });
    toast.success("Plik usunięty");
  };

  const handleSaveUserSources = () => {
    let finalUrls = [...urls];
    if (urlInput.trim()) {
      try {
        const normalizedUrl = normalizeUrl(urlInput.trim());
        new URL(normalizedUrl);
        if (finalUrls.length + files.length < 6) {
          if (
            !finalUrls.some(
              (existing) =>
                existing.toLowerCase() === normalizedUrl.toLowerCase()
            )
          ) {
            finalUrls.push(normalizedUrl);
          }
        } else {
          toast.error(
            "Osiągnięto limit 6 źródeł - nie dodano ostatniego linku"
          );
        }
      } catch {
        toast.error("Nieprawidłowy link - nie został dodany");
      }
    }

    setValue("userSources", { urls: finalUrls, files });
    setUrls(finalUrls);
    setUrlInput("");
    setShowSourcesModal(false);

    const totalSources = finalUrls.length + files.length;
    if (totalSources > 0) {
      toast.success(
        `Zapisano ${totalSources} ${totalSources === 1 ? "źródło" : "źródeł"}`,
        { icon: "✅" }
      );
    }
  };

  const handleOpenSourcesModal = () => {
    const currentSources = watch("userSources");
    if (currentSources) {
      setUrls(currentSources.urls || []);
      setFiles(currentSources.files || []);
    }
    setUrlInput("");
    setShowSourcesModal(true);
  };

  const handleCancelSources = () => {
    const currentSources = watch("userSources");
    if (currentSources) {
      setUrls(currentSources.urls || []);
      setFiles(currentSources.files || []);
    } else {
      setUrls([]);
      setFiles([]);
    }
    setUrlInput("");
    setShowSourcesModal(false);
  };

  const handleOpenSeoModal = () => {
    setShowSeoModal(true);
  };

  const handleSaveSeo = () => {
    // Dodaj frazę z inputa jeśli jest wpisana
    if (seoKeywordInput.trim()) {
      const trimmed = seoKeywordInput.trim();
      if (
        !seoKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase()) &&
        seoKeywords.length < 10
      ) {
        setSeoKeywords([...seoKeywords, trimmed]);
      }
    }

    // Dodaj link z inputów jeśli są oba pola wypełnione
    if (linkUrl.trim() && linkAnchor.trim()) {
      const normalizedUrl = normalizeLinkUrl(linkUrl.trim());
      try {
        new URL(normalizedUrl);
        if (seoLinks.length < maxLinks) {
          setSeoLinks([
            ...seoLinks,
            { url: normalizedUrl, anchor: linkAnchor.trim() },
          ]);
        }
      } catch (error) {
        console.warn("Nieprawidłowy URL, pomijam");
      }
    }

    setSeoKeywordInput("");
    setLinkUrl("");
    setLinkAnchor("");
    setShowSeoModal(false);

    const totalSeo = seoKeywords.length + seoLinks.length;
    if (totalSeo > 0) {
      toast.success(
        `Zapisano ${totalSeo} ${totalSeo === 1 ? "element" : "elementów"} SEO`,
        { icon: "🎯" }
      );
    }
  };

  const handleCancelSeo = () => {
    setSeoKeywordInput("");
    setLinkUrl("");
    setLinkAnchor("");
    setShowSeoModal(false);
  };

  const handleAddText = async () => {
    if (texts.length >= MAX_TEXTS_PER_ORDER && editingIndex === null) {
      toast.error(
        `Maksymalnie ${MAX_TEXTS_PER_ORDER} tekstów w jednym zamówieniu`,
        { duration: 4000 }
      );
      return;
    }

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

    // ✅ DODAJ DANE SEO
    const textWithSeo = {
      ...data,
      seoData:
        seoKeywords.length > 0 || seoLinks.length > 0
          ? {
              keywords: seoKeywords,
              links: seoLinks,
            }
          : undefined,
    };

    if (editingIndex !== null) {
      const updatedTexts = [...texts];
      updatedTexts[editingIndex] = textWithSeo;
      setTexts(updatedTexts);
      setEditingIndex(null);
      toast.success("Tekst zaktualizowany", { icon: "✅" });
    } else {
      setTexts([...texts, textWithSeo]);
      toast.success("Tekst dodany do zamówienia");
    }

    // Reset formularza + SEO
    reset({
      topic: "",
      length: 1,
      lengthUnit: "PAGES",
      language: "pl",
      textType: "",
      customType: "",
      guidelines: "",
      userSources: { urls: [], files: [] },
      seoData: { keywords: [], links: [] },
    });

    setUrls([]);
    setFiles([]);
    setSeoKeywords([]);
    setSeoLinks([]);
  };

  const handleEditText = (index: number) => {
    const textToEdit = texts[index];

    reset({
      topic: textToEdit.topic,
      length: textToEdit.length,
      lengthUnit: textToEdit.lengthUnit,
      language: textToEdit.language,
      textType: textToEdit.textType || "",
      customType: textToEdit.customType || "",
      guidelines: textToEdit.guidelines || "",
      userSources: textToEdit.userSources || { urls: [], files: [] },
      seoData: textToEdit.seoData || { keywords: [], links: [] },
    });

    if (textToEdit.userSources) {
      setUrls(textToEdit.userSources.urls || []);
      setFiles(textToEdit.userSources.files || []);
    }

    // ✅ ZAŁADUJ DANE SEO
    if (textToEdit.seoData) {
      setSeoKeywords(textToEdit.seoData.keywords || []);
      setSeoLinks(textToEdit.seoData.links || []);
    } else {
      setSeoKeywords([]);
      setSeoLinks([]);
    }

    setEditingIndex(index);
    toast(`Edytujesz: ${textToEdit.topic}`, { icon: "✏️" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ ZAKTUALIZUJ handleCancelEdit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset({
      topic: "",
      length: 1,
      lengthUnit: "PAGES",
      language: "pl",
      textType: "",
      customType: "",
      guidelines: "",
      userSources: { urls: [], files: [] },
      seoData: { keywords: [], links: [] },
    });
    setUrls([]);
    setFiles([]);
    setSeoKeywords([]);
    setSeoLinks([]);
    toast("Anulowano edycję");
  };

  const handleRemoveText = (index: number) => {
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && index < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }

    setTexts(texts.filter((_, i) => i !== index));
    toast.success("Tekst usunięty");
  };

  const handleSubmit = async () => {
    // Sprawdź zgodę na brak zwrotu
    if (!noRefundConsent) {
      toast.error("Musisz wyrazić zgodę na rozpoczęcie realizacji zamówienia", {
        duration: 4000,
      });
      return;
    }
    const data = watch();
    const isFormFilled = data.topic && data.topic.trim().length >= 3;

    let orderTexts = [...texts];

    if (isFormFilled) {
      const isValid = await trigger();

      if (!isValid) {
        if (errors.topic) {
          toast.error(errors.topic.message || "Podaj temat");
        } else if (errors.length) {
          toast.error(errors.length.message || "Nieprawidłowa długość");
        } else if (errors.language) {
          toast.error(errors.language.message || "Wybierz język");
        } else {
          toast.error("Uzupełnij wszystkie wymagane pola aktualnego tekstu");
        }
        return;
      }

      let finalKeywords = [...seoKeywords];
      let finalLinks = [...seoLinks];

      // Dodaj frazę z inputa jeśli jest wpisana
      if (seoKeywordInput.trim()) {
        const trimmed = seoKeywordInput.trim();
        if (
          !finalKeywords.some(
            (k) => k.toLowerCase() === trimmed.toLowerCase()
          ) &&
          finalKeywords.length < 10
        ) {
          finalKeywords.push(trimmed);
        }
      }

      // Dodaj link z inputów jeśli są oba pola wypełnione
      if (linkUrl.trim() && linkAnchor.trim()) {
        const normalizedUrl = normalizeLinkUrl(linkUrl.trim());
        try {
          new URL(normalizedUrl);
          if (finalLinks.length < maxLinks) {
            finalLinks.push({ url: normalizedUrl, anchor: linkAnchor.trim() });
          }
        } catch (error) {
          console.warn("Nieprawidłowy URL, pomijam");
        }
      }

      const textWithSeo = {
        ...data,
        seoData:
          seoKeywords.length > 0 || seoLinks.length > 0
            ? {
                keywords: seoKeywords,
                links: seoLinks,
              }
            : undefined,
      };

      orderTexts.push(textWithSeo);
      console.log(`✅ Dodano aktualny formularz do zamówienia`);
    }

    if (orderTexts.length === 0) {
      toast.error("Wypełnij formularz lub dodaj teksty do listy");
      return;
    }

    console.log(`📦 Wysyłam ${orderTexts.length} tekstów do backendu`);

    saveOrderDraft({
      currentForm: data,
      texts: texts,
    });

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("textsData", JSON.stringify(orderTexts));

      orderTexts.forEach((text, textIndex) => {
        text.userSources?.files?.forEach((file: File) => {
          formData.append(`text_${textIndex}_files`, file);
        });
      });

      await apiClient.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearOrderDraft();
      toast.success("Zamówienie złożone pomyślnie!");
      reset();
      setTexts([]);
      setUrls([]);
      setFiles([]);
      setEditingIndex(null);
      setNoRefundConsent(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Złóż zamówienie
        </h2>
      </div>

      {/* BANNER TRYBU EDYCJI */}
      {editingIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Tryb edycji aktywny
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Edytujesz tekst #{editingIndex + 1}:{" "}
                  {texts[editingIndex]?.topic}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary text-sm"
            >
              Anuluj edycję
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista dodanych tekstów */}
      {texts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card dark:bg-gray-800 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Teksty w zamówieniu ({texts.length})
            </h3>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalTextsPrice.toFixed(2)} zł
            </span>
          </div>
          <div className="space-y-3">
            {texts.map((text, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  editingIndex === index
                    ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-600"
                    : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {index + 1}. {text.topic}
                    {editingIndex === index && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        Edytujesz
                      </span>
                    )}
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
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {calculatePrice(
                      calculateCharacters(text.length, text.lengthUnit)
                    ).toFixed(2)}{" "}
                    zł
                  </span>
                  <button
                    onClick={() => handleEditText(index)}
                    disabled={editingIndex !== null && editingIndex !== index}
                    className="p-2 text-blue-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edytuj tekst"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveText(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Usuń tekst"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Formularz + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Form (bez zmian) */}
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
              max={watchedUnit === "PAGES" ? 150 : 300000} // ✅ NOWE LIMITY
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
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
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
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Rodzaj tekstu (opcjonalnie)
            </label>
            <select
              {...register("textType")}
              className="input w-full mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Wybierz rodzaj</option>
              {Object.entries(TEXT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <AnimatePresence>
              {watchedTextType === "OTHER" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  {...register("customType")}
                  type="text"
                  placeholder="Wpisz własny rodzaj tekstu"
                  className="input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* WŁASNE ŹRÓDŁA */}
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

            {/* PODGLĄD ŹRÓDEŁ */}
            {(urls.length > 0 || files.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
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
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
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

          {/* SEO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                🎯 Optymalizacja SEO (opcjonalnie)
              </label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 bottom-6 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                  Dodaj frazy kluczowe i linki SEO. Tekst zostanie naturalnie
                  zoptymalizowany pod wskazane parametry.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenSeoModal}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-4 h-4" />
              {seoKeywords.length + seoLinks.length > 0
                ? `Edytuj sekcję SEO (${
                    seoKeywords.length + seoLinks.length
                  } elementów)`
                : "Dodaj frazy kluczowe i/lub linkowanie"}
            </button>

            {/* PODGLĄD SEO */}
            {(seoKeywords.length > 0 || seoLinks.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                {/* Frazy kluczowe */}
                {seoKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      🔑 Frazy kluczowe ({seoKeywords.length}/10)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {seoKeywords.map((keyword, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          <span>{keyword}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(index)}
                            className="hover:text-red-600 dark:hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linki SEO */}
                {seoLinks.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      🔗 Linki SEO ({seoLinks.length}/{maxLinks})
                    </p>
                    <div className="space-y-2">
                      {seoLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                        >
                          <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {link.anchor}
                            </p>
                            <p
                              className="text-xs text-gray-600 dark:text-gray-400 truncate"
                              title={link.url}
                            >
                              {link.url}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

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
                {/* Teksty na liście */}
                {texts.length > 0 && (
                  <div className="pb-3 border-b border-purple-200 dark:border-purple-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        Teksty w zamówieniu:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {texts.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Suma tekstów:
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {totalTextsPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                )}

                {/* ✅ AKTUALNY FORMULARZ - TYLKO JEŚLI WYPEŁNIONY */}
                {isFormFilled && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      {editingIndex !== null
                        ? "Edytowany tekst:"
                        : texts.length > 0
                        ? "Aktualny tekst:"
                        : "Aktualny tekst:"}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Długość:
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
                        Cena:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {currentPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                )}

                {/* ✅ INFO jeśli formularz pusty */}
                {!isFormFilled && texts.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      💡 Wypełnij formularz aby dodać kolejny tekst
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-purple-200 dark:border-purple-800 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {texts.length > 0 || isFormFilled
                      ? "Suma całkowita:"
                      : "Do zapłaty:"}
                  </span>
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {totalPrice.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {/* Przyciski */}
              <button
                type="button"
                onClick={handleAddText}
                disabled={
                  texts.length >= MAX_TEXTS_PER_ORDER && editingIndex === null
                }
                className={`btn w-full mb-3 flex items-center justify-center gap-2 ${
                  editingIndex !== null
                    ? "btn-primary bg-blue-600 hover:bg-blue-700"
                    : "btn-secondary"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {editingIndex !== null ? (
                  <>
                    <Check className="w-5 h-5" />
                    Zaktualizuj tekst
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {texts.length >= MAX_TEXTS_PER_ORDER
                      ? `Limit ${MAX_TEXTS_PER_ORDER} tekstów`
                      : "Dodaj kolejny tekst"}
                  </>
                )}
              </button>

              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary w-full mb-3 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Anuluj edycję
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
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
              {/* ZGODA NA BRAK ZWROTU */}
              <div className="mb-0 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={noRefundConsent}
                    onChange={(e) => setNoRefundConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      Wyrażam zgodę na natychmiastowe rozpoczęcie realizacji
                      zamówienia i przyjmuję do wiadomości, że po rozpoczęciu
                      prac utracę prawo odstąpienia od umowy
                    </span>
                  </div>
                </label>

                {/* Rozwijany panel z info prawnym */}
                <button
                  type="button"
                  onClick={() => setShowLegalInfo(!showLegalInfo)}
                  className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span>Dlaczego nie mogę zwrócić zamówionego tekstu?</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showLegalInfo ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showLegalInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-gray-700 dark:text-gray-300 space-y-2"
                    >
                      <div className="flex gap-2">
                        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-semibold">
                            Podstawa prawna: Art. 38 pkt 13 ustawy o prawach
                            konsumenta
                          </p>
                          <p>
                            Zgodnie z polskim prawem, konsument nie ma prawa do
                            odstąpienia od umowy o dostarczanie treści cyfrowych
                            (takich jak teksty generowane przez AI), jeżeli:
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                              przedsiębiorca rozpoczął świadczenie za wyraźną
                              zgodą konsumenta
                            </li>
                            <li>
                              konsument został poinformowany o utracie prawa
                              odstąpienia
                            </li>
                            <li>konsument przyjął to do wiadomości</li>
                          </ul>
                          <p className="pt-2 border-t border-amber-200 dark:border-amber-700">
                            Po złożeniu zamówienia i rozpoczęciu generowania
                            tekstu przez AI, usługa zostaje spełniona i nie ma
                            możliwości jej zwrotu - podobnie jak w przypadku
                            pobrania e-booka czy dostępu do kursu online.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                {editingIndex !== null
                  ? "Zaktualizuj lub anuluj edycję"
                  : texts.length > 0
                  ? isFormFilled
                    ? `${texts.length} tekstów + aktualny formularz`
                    : `${texts.length} ${
                        texts.length === 1
                          ? "tekst"
                          : texts.length < 5
                          ? "teksty"
                          : "tekstów"
                      } w zamówieniu`
                  : isFormFilled
                  ? "Dodaj do listy lub złóż zamówienie"
                  : ""}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MODAL ŹRÓDEŁ - bez zmian */}
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

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* LINKI */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Linki do stron internetowych
                  </label>
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
                      className={`btn px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                        urlInput.trim()
                          ? "btn-primary ring-2 ring-purple-300 dark:ring-purple-500 animate-pulse"
                          : "btn-primary"
                      }`}
                    >
                      Dodaj
                    </button>
                  </div>
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
                        do napisania w pełni oryginalnego tekstu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  type="button"
                  onClick={handleCancelSources}
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
                  Zatwierdź (
                  {urls.length + files.length + (urlInput.trim() ? 1 : 0)})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* MODAL SEO */}
        <AnimatePresence>
          {showSeoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSeoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      🎯 Optymalizacja SEO
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {seoKeywords.length} fraz • {seoLinks.length}/{maxLinks}{" "}
                      linków
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSeoModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* FRAZY KLUCZOWE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                      🔑 Frazy kluczowe (max 10)
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Tekst zostanie naturalnie zoptymalizowany pod te frazy.
                      Podaj najważniejsze słowa kluczowe.
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={seoKeywordInput}
                        onChange={(e) => setSeoKeywordInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddKeyword()
                        }
                        placeholder="np. copywriting AI"
                        disabled={seoKeywords.length >= 10}
                        className="input flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        disabled={seoKeywords.length >= 10}
                        className={`btn px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                          seoKeywordInput.trim()
                            ? "btn-primary ring-2 ring-purple-300 dark:ring-purple-500 animate-pulse"
                            : "btn-primary"
                        }`}
                      >
                        Dodaj
                      </button>
                    </div>

                    {seoKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {seoKeywords.map((keyword, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            <span>{keyword}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(index)}
                              className="hover:text-red-600 dark:hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LINKOWANIE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                      🔗 Linkowanie zewnętrzne (max {maxLinks} linków)
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Linki zostaną naturalnie wplecione w tekst z podanymi
                      anchorami.
                      {maxLinks === 0 && (
                        <span className="block mt-1 text-orange-600 dark:text-orange-400">
                          ⚠️ Tekst zbyt krótki (min. 2000 znaków)
                        </span>
                      )}
                    </p>

                    {maxLinks > 0 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com/strona"
                            disabled={!canAddMoreLinks}
                            className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                          />
                          <input
                            type="text"
                            value={linkAnchor}
                            onChange={(e) => setLinkAnchor(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleAddLink()
                            }
                            placeholder="tekst anchora"
                            disabled={!canAddMoreLinks}
                            className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLink}
                          disabled={!canAddMoreLinks}
                          className="btn btn-primary w-full disabled:opacity-50"
                        >
                          {canAddMoreLinks
                            ? `Dodaj link (${seoLinks.length}/${maxLinks})`
                            : `Osiągnięto limit ${maxLinks} linków`}
                        </button>
                      </>
                    )}

                    {seoLinks.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {seoLinks.map((link, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                          >
                            <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {link.anchor}
                              </p>
                              <p
                                className="text-xs text-gray-600 dark:text-gray-400 truncate"
                                title={link.url}
                              >
                                {link.url}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(index)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* INFO SEO */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <p>
                          <strong>Frazy kluczowe:</strong> Będą naturalnie
                          wplecione w tekst (tytuły, nagłówki, treść).
                        </p>
                        <p>
                          <strong>Linki:</strong> Zostaną rozmieszczone
                          równomiernie w tekście zgodnie z kontekstem.
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          💡 Limity linków: ≤2000 znaków = 2 linki | 3000-5000 =
                          3 linki | &gt;5000 = 5 linków
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    type="button"
                    onClick={handleCancelSeo}
                    className="btn btn-secondary flex-1"
                  >
                    Anuluj
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSeo}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Zatwierdź (
                    {seoKeywords.length +
                      seoLinks.length +
                      (seoKeywordInput.trim() ? 1 : 0) +
                      (linkUrl.trim() && linkAnchor.trim() ? 1 : 0)}
                    )
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </motion.div>
  );
};
