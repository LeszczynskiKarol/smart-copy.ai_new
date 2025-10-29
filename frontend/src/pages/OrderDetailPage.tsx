// frontend/src/pages/OrderDetailPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "@/utils/orderTitle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSidebar } from "@/components/layout/UserSidebar";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Clock,
  CheckCircle,
  Package,
  Calendar,
  FileText,
  Globe,
  Copy,
  Edit,
  Save,
  X,
  FileDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { getOrderFullTitle } from "@/utils/orderTitle";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { convert } from "html-to-text";

const proseStyles = `
  .prose h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: inherit;
  }
  .prose h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    color: inherit;
  }
  .prose h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: inherit;
  }
  .prose p {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    line-height: 1.75;
  }
  .prose ul, .prose ol {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
  }
  .prose li {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  .prose strong {
    font-weight: 600;
    color: inherit;
  }
  .prose em {
    font-style: italic;
  }
`;

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  texts: Array<{
    id: string;
    topic: string;
    length: number;
    pages: number;
    language: string;
    textType: string;
    customType: string | null;
    guidelines: string | null;
    price: number;
    content: string | null;
  }>;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      icon: Clock,
      label: "Oczekujące",
    },
    IN_PROGRESS: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: Package,
      label: "W realizacji",
    },
    COMPLETED: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: CheckCircle,
      label: "Zakończone",
    },
  };
  const statusConfig = config[status as keyof typeof config] || config.PENDING;
  const Icon = statusConfig.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusConfig.label}
    </span>
  );
};

// Funkcja do parsowania HTML na elementy DOCX
function parseHtmlToDocx(html: string): any[] {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const paragraphs: any[] = [];

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        return new TextRun({ text });
      }
      return null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Przetwarzaj dzieci
      const children: any[] = [];
      element.childNodes.forEach((child) => {
        const processed = processNode(child);
        if (processed) {
          if (Array.isArray(processed)) {
            children.push(...processed);
          } else {
            children.push(processed);
          }
        }
      });

      switch (tagName) {
        case "h1":
          paragraphs.push(
            new Paragraph({
              text: element.textContent || "",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );
          return null;

        case "h2":
          paragraphs.push(
            new Paragraph({
              text: element.textContent || "",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
          return null;

        case "h3":
          paragraphs.push(
            new Paragraph({
              text: element.textContent || "",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
          return null;

        case "p":
          if (children.length > 0) {
            paragraphs.push(
              new Paragraph({
                children,
                spacing: { after: 150 },
              })
            );
          } else if (element.textContent?.trim()) {
            paragraphs.push(
              new Paragraph({
                text: element.textContent.trim(),
                spacing: { after: 150 },
              })
            );
          }
          return null;

        case "strong":
        case "b":
          return new TextRun({ text: element.textContent || "", bold: true });

        case "em":
        case "i":
          return new TextRun({
            text: element.textContent || "",
            italics: true,
          });

        case "ul":
          element.querySelectorAll("li").forEach((li) => {
            paragraphs.push(
              new Paragraph({
                text: `• ${li.textContent?.trim() || ""}`,
                spacing: { after: 100 },
                indent: { left: 720 },
              })
            );
          });
          return null;

        case "ol":
          element.querySelectorAll("li").forEach((li, index) => {
            paragraphs.push(
              new Paragraph({
                text: `${index + 1}. ${li.textContent?.trim() || ""}`,
                spacing: { after: 100 },
                indent: { left: 720 },
              })
            );
          });
          return null;

        case "br":
          paragraphs.push(new Paragraph({ text: "" }));
          return null;

        default:
          return children;
      }
    }

    return null;
  };

  tempDiv.childNodes.forEach((node) => processNode(node));

  return paragraphs;
}

// Komponent karty tekstu z edytorem
const TextCard = ({
  text,
  index,
  orderId,
  expandedGuidelines,
  toggleGuidelines,
  truncateText,
}: any) => {
  const isGuidelinesExpanded = expandedGuidelines.has(text.id);
  const hasLongGuidelines = text.guidelines && text.guidelines.length > 50;

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // NOWE
  const queryClient = useQueryClient();

  const content = text.content ? JSON.parse(text.content) : null;
  const generatedContent = content?.generatedContent || "";
  const isGenerated = !!generatedContent;

  // Pobierz plain text
  const plainText = convert(generatedContent, { wordwrap: false });

  const hasMore = plainText.length > 500;

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Zacznij pisać...",
      }),
    ],
    content: generatedContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // Mutacja do zapisu
  const saveMutation = useMutation({
    mutationFn: async (htmlContent: string) => {
      const res = await apiClient.put(`/texts/${text.id}`, {
        content: htmlContent,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Zmiany zapisane!");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: () => {
      toast.error("Błąd zapisu zmian");
    },
  });

  const handleSave = () => {
    if (editor) {
      const htmlContent = editor.getHTML();
      saveMutation.mutate(htmlContent);
    }
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(generatedContent);
    }
    setIsEditing(false);
  };

  // Pobierz PDF
  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generowanie PDF...", { id: "pdf-gen" });

      const element = document.createElement("div");
      element.innerHTML = generatedContent;
      element.style.padding = "40px";
      element.style.fontFamily = "Arial, sans-serif";
      element.style.fontSize = "14px";
      element.style.lineHeight = "1.6";
      element.style.color = "#000";
      element.style.maxWidth = "800px";

      const style = document.createElement("style");
      style.textContent = `
      h1 { 
        font-size: 24px; 
        font-weight: bold; 
        margin: 20px 0 10px 0;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      h2 { 
        font-size: 20px; 
        font-weight: bold; 
        margin: 16px 0 8px 0;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      h3 { 
        font-size: 18px; 
        font-weight: bold; 
        margin: 14px 0 7px 0;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      p { 
        margin: 0 0 14px 0;
        page-break-inside: avoid;
        orphans: 3;
        widows: 3;
      }
      ul, ol { 
        margin: 10px 0 14px 0; 
        padding-left: 30px;
        page-break-inside: avoid;
      }
      li { 
        margin: 6px 0;
      }
      strong { font-weight: bold; }
      em { font-style: italic; }
      * {
        box-sizing: border-box;
      }
    `;
      element.appendChild(style);

      const opt: any = {
        margin: [20, 20, 25, 20], // top, right, bottom, left - zwiększone marginesy!
        filename: `${text.topic.replace(/[^a-z0-9]/gi, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
          avoid: ["p", "h1", "h2", "h3", "ul", "ol"],
        },
      };

      await html2pdf().set(opt).from(element).save();

      toast.success("PDF pobrany!", { id: "pdf-gen" });
    } catch (error) {
      console.error(error);
      toast.error("Błąd generowania PDF", { id: "pdf-gen" });
    }
  };

  // Pobierz DOCX
  const handleDownloadDOCX = async () => {
    try {
      toast.loading("Generowanie DOCX...", { id: "docx-gen" });

      const paragraphs = parseHtmlToDocx(generatedContent);

      if (paragraphs.length === 0) {
        paragraphs.push(
          new Paragraph({
            text: plainText,
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${text.topic.replace(/[^a-z0-9]/gi, "_")}.docx`);

      toast.success("DOCX pobrany!", { id: "docx-gen" });
    } catch (error) {
      console.error(error);
      toast.error("Błąd generowania DOCX", { id: "docx-gen" });
    }
  };

  // Skopiuj jako plain text
  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      toast.success("Skopiowano do schowka!");
    } catch (error) {
      toast.error("Błąd kopiowania");
    }
  };

  // Skopiuj jako HTML
  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success("HTML skopiowany do schowka!");
    } catch (error) {
      toast.error("Błąd kopiowania");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {capitalizeFirstLetter(text.topic)}
            </h3>
            {isGenerated && <CheckCircle className="w-5 h-5 text-green-500" />}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 ml-11">
            <span className="flex items-center gap-1">
              📄 {text.pages} stron
            </span>
            <span className="flex items-center gap-1">
              ✍️ {text.length.toLocaleString()} znaków
            </span>
            <span className="flex items-center gap-1">
              🌍 {text.language.toUpperCase()}
            </span>
          </div>

          {/* ✅ ZAKTUALIZOWANA SEKCJA WYTYCZNYCH */}
          {text.guidelines && (
            <div className="ml-11 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                Wytyczne:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {isGuidelinesExpanded || !hasLongGuidelines
                  ? text.guidelines
                  : truncateText(text.guidelines, 50)}
              </p>
              {hasLongGuidelines && (
                <button
                  onClick={() => toggleGuidelines(text.id)}
                  className="mt-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-1 group"
                >
                  {isGuidelinesExpanded ? (
                    <>
                      Pokaż mniej
                      <svg
                        className="w-3 h-3 transform group-hover:-translate-y-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      Pokaż więcej ({text.guidelines.length} znaków)
                      <svg
                        className="w-3 h-3 transform group-hover:translate-y-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {parseFloat(text.price.toString()).toFixed(2)} zł
          </p>
        </div>
      </div>

      {isGenerated && (
        <>
          {/* Podgląd treści z rozwijaniem */}
          {!isEditing && (
            <div className="mb-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <AnimatePresence mode="wait">
                  {!isExpanded ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                      style={{
                        maxHeight: "300px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                      />
                      {hasMore && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Przycisk Pokaż więcej/mniej */}
              {hasMore && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <span>Pokaż mniej</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Pokaż więcej</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Edytor */}
          <AnimatePresence>
            {isEditing && editor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="border-2 border-purple-500 dark:border-purple-600 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("bold")
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("italic")
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <em>I</em>
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("heading", { level: 2 })
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      H2
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("heading", { level: 3 })
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      H3
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("bulletList")
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Lista
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        editor.isActive("orderedList")
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      1. Lista
                    </button>
                  </div>

                  {/* Editor Content */}
                  <div className="bg-white dark:bg-gray-900 max-h-[600px] overflow-y-auto text-gray-700 dark:text-gray-300">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                {/* Przyciski edytora */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? "Zapisywanie..." : "Zapisz"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Anuluj
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Przyciski akcji */}
          {!isEditing && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edytuj
              </button>
              <button
                onClick={handleDownloadPDF}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <FileDown className="w-4 h-4" />
                Pobierz PDF
              </button>
              <button
                onClick={handleDownloadDOCX}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Pobierz DOCX
              </button>
              <button
                onClick={handleCopyPlainText}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Kopiuj tekst
              </button>
              <button
                onClick={handleCopyHTML}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                Kopiuj HTML
              </button>
            </div>
          )}
        </>
      )}

      {!isGenerated && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Generowanie...
        </div>
      )}
    </motion.div>
  );
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedGuidelines, setExpandedGuidelines] = useState<Set<string>>(
    new Set()
  );

  const toggleGuidelines = (textId: string) => {
    setExpandedGuidelines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(textId)) {
        newSet.delete(textId);
      } else {
        newSet.add(textId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data as Order;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "IN_PROGRESS" ? 5000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <UserSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">
            Ładowanie zamówienia...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <UserSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Zamówienie nie znalezione
            </h2>
            <button
              onClick={() => navigate("/orders")}
              className="btn btn-primary"
            >
              Wróć do zamówień
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <UserSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót do zamówień
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {getOrderFullTitle(order)}
                </h1>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {order.orderNumber}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Wartość zamówienia
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {parseFloat(order.totalPrice.toString()).toFixed(2)} zł
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700 mb-6"
          >
            <style>{proseStyles}</style>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Podsumowanie zamówienia
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Data złożenia</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Liczba tekstów</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.texts.length}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Status</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Języki</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {[
                    ...new Set(
                      order.texts.map((t) => t.language.toUpperCase())
                    ),
                  ].join(", ")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Texts List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Zamówione teksty ({order.texts.length})
            </h2>
            {order.texts.map((text, index) => (
              <TextCard
                key={text.id}
                text={text}
                index={index}
                orderId={id}
                expandedGuidelines={expandedGuidelines}
                toggleGuidelines={toggleGuidelines}
                truncateText={truncateText}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
