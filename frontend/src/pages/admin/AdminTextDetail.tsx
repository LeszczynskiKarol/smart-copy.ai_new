// frontend/src/pages/admin/AdminTextDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Edit, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import toast from "react-hot-toast";
import { ProgressBar } from "@/components/orders/ProgressBar";

// Komponent do wyświetlania promptu i odpowiedzi
const PromptResponseCard = ({
  title,
  prompt,
  response,
  defaultExpanded = false,
}: {
  title: string;
  prompt: string | null;
  response: string | null;
  defaultExpanded?: boolean;
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!prompt && !response) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            {prompt && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  📤 Prompt:
                </h5>
                <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap text-gray-900 dark:text-gray-300">
                  {prompt}
                </pre>
              </div>
            )}

            {response && (
              <div className="p-4">
                <h5 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  📥 Odpowiedź:
                </h5>
                <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap text-gray-900 dark:text-gray-300">
                  {response}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminTextDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "prompts" | "sources">(
    "content"
  );

  const { data: text, isLoading } = useQuery({
    queryKey: ["admin-text", id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/texts/${id}/details`);
      return res.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.progress && data.progress !== "completed" ? 5000 : false;
    },
  });

  // Parse content
  const content = text?.content ? JSON.parse(text.content) : null;
  const generatedContent = content?.generatedContent || "";
  const writerPrompts = text?.writerPrompts
    ? JSON.parse(text.writerPrompts)
    : [];
  const writerResponses = text?.writerResponses
    ? JSON.parse(text.writerResponses)
    : [];

  // Tiptap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: generatedContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // Mutacja do zapisu edytowanej treści
  const saveMutation = useMutation({
    mutationFn: async (htmlContent: string) => {
      await apiClient.patch(`/admin/texts/${id}/content`, { htmlContent });
    },
    onSuccess: () => {
      toast.success("Treść zapisana!");
      queryClient.invalidateQueries({ queryKey: ["admin-text", id] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Błąd zapisu treści");
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          Ładowanie...
        </div>
      </AdminLayout>
    );
  }

  if (!text) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tekst nie znaleziony</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn btn-primary"
          >
            Wróć do zamówień
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(`/admin/orders/${text.order.id}`)}
          className="flex items-center gap-2 text-purple-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do zamówienia
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {text.topic}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📄 {text.pages} stron</span>
            <span>✍️ {text.length.toLocaleString()} znaków</span>
            <span>🌍 {text.language.toUpperCase()}</span>
            <span>📝 {text.textType}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Zamówienie: {text.order.orderNumber} • Użytkownik:{" "}
            {text.order.user.email}
          </p>
        </div>

        {/* Progress Bar */}
        {text.progress && text.progress !== "completed" && (
          <div className="mb-6">
            <ProgressBar
              progress={text.progress}
              textLength={text.length}
              startTime={text.startTime}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === "content"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Treść
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === "prompts"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Prompty i odpowiedzi
            </button>
            <button
              onClick={() => setActiveTab("sources")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === "sources"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Źródła
            </button>
          </nav>
        </div>

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {!generatedContent && text.progress !== "completed" && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Treść jest w trakcie generowania...
              </div>
            )}

            {!generatedContent && text.progress === "completed" && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Brak wygenerowanej treści
              </div>
            )}

            {generatedContent && !isEditing && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edytuj treść
                  </button>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedContent }}
                />
              </div>
            )}

            {generatedContent && isEditing && editor && (
              <div>
                <div className="border-2 border-purple-500 dark:border-purple-600 rounded-lg overflow-hidden mb-4">
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

                  {/* Editor */}
                  <div className="bg-white dark:bg-gray-900 max-h-[600px] overflow-y-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-2">
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
              </div>
            )}
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === "prompts" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Prompty i odpowiedzi Claude
            </h2>

            {/* Query */}
            <PromptResponseCard
              title="1️⃣ Generowanie zapytania Google"
              prompt={text.queryPrompt}
              response={text.queryResponse}
              defaultExpanded
            />

            {/* Select Sources */}
            <PromptResponseCard
              title="2️⃣ Wybór najlepszych źródeł"
              prompt={text.selectPrompt}
              response={text.selectResponse}
            />

            {/* Structure (if exists) */}
            {text.structurePrompt && (
              <PromptResponseCard
                title="3️⃣ Tworzenie struktury tekstu (Kierownik)"
                prompt={text.structurePrompt}
                response={text.structureResponse}
              />
            )}

            {/* Writer Prompts */}
            {writerPrompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pisarze (generowanie treści):
                </h3>
                {writerPrompts.map((prompt: string, index: number) => (
                  <PromptResponseCard
                    key={index}
                    title={`${text.structurePrompt ? "4️⃣" : "3️⃣"} Pisarz ${
                      index + 1
                    }${
                      writerPrompts.length > 1
                        ? ` / ${writerPrompts.length}`
                        : ""
                    }`}
                    prompt={prompt}
                    response={writerResponses[index]}
                  />
                ))}
              </div>
            )}

            {!text.queryPrompt &&
              !text.selectPrompt &&
              !text.structurePrompt &&
              writerPrompts.length === 0 && (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  Brak zapisanych promptów (tekst nie został jeszcze
                  wygenerowany)
                </div>
              )}
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === "sources" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Źródła wykorzystane do generowania
            </h2>

            {content?.googleQuery && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  🔍 Zapytanie Google:
                </h3>
                <p className="text-blue-800 dark:text-blue-200 font-mono">
                  {content.googleQuery}
                </p>
              </div>
            )}

            {content?.selectedSources && content.selectedSources.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  ✅ Wybrane źródła ({content.selectedSources.length}):
                </h3>
                <div className="space-y-2">
                  {content.selectedSources.map((source: any, index: number) => (
                    <div
                      key={index}
                      className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
                    >
                      <div className="font-semibold text-green-900 dark:text-green-300 mb-1">
                        {index + 1}. {source.title}
                      </div>

                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 dark:text-green-400 hover:underline break-all"
                      >
                        {source.link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content?.scrapedContent && content.scrapedContent.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  📄 Zescrapowana treść:
                </h3>
                <div className="space-y-2">
                  {content.scrapedContent.map((scraped: any, index: number) => (
                    <details
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="font-semibold">
                          {index + 1}. {scraped.url}
                        </span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          ({scraped.length.toLocaleString()} znaków)
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto whitespace-pre-wrap text-gray-900 dark:text-gray-300">
                          {scraped.text.substring(0, 2000)}
                          {scraped.text.length > 2000 && "..."}
                        </pre>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {!content && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Brak danych o źródłach (tekst nie został jeszcze wygenerowany)
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
