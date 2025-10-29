// frontend/src/types/order.ts

export type LengthUnit = "PAGES" | "CHARACTERS";

export type TextType =
  | "ARTICLE"
  | "REPORT"
  | "COMPANY_TEXT"
  | "ANALYSIS"
  | "BLOG_POST"
  | "SOCIAL_MEDIA"
  | "EMAIL_MARKETING"
  | "PRODUCT_DESCRIPTION"
  | "OTHER";

// ✅ NOWY TYP: Link SEO
export interface SeoLink {
  url: string;
  anchor: string;
}

// ✅ NOWY TYP: Dane SEO
export interface SeoData {
  keywords: string[]; // Frazy kluczowe
  links: SeoLink[]; // Linki do wstawienia
}

export interface TextFormData {
  topic: string;
  length: number;
  lengthUnit: LengthUnit;
  language: string;
  textType: TextType;
  customType?: string;
  guidelines?: string;
  seoData?: SeoData; // ✅ NOWE POLE
}

export interface OrderFormData {
  texts: TextFormData[];
}

export const TEXT_TYPES = {
  ARTICLE: "Artykuł",
  REPORT: "Raport",
  COMPANY_TEXT: "Tekst o firmie",
  ANALYSIS: "Analiza",
  BLOG_POST: "Post blogowy",
  PRODUCT_DESCRIPTION: "Opis produktu",
  CATEGORY_DESCRIPTION: "Opis kategorii",
  OTHER: "Inny - wpisz własny",
};

export const LANGUAGES = [
  { value: "pl", label: "Polski" },
  { value: "en", label: "Angielski" },
  { value: "de", label: "Niemiecki" },
  { value: "es", label: "Hiszpański" },
  { value: "fr", label: "Francuski" },
  { value: "it", label: "Włoski" },
  { value: "pt", label: "Portugalski" },
  { value: "uk", label: "Ukraiński" },
  { value: "ru", label: "Rosyjski" },
];

// ✅ HELPER: Oblicz limit linków na podstawie długości
export function calculateMaxLinks(
  length: number,
  lengthUnit: LengthUnit
): number {
  const characters = lengthUnit === "PAGES" ? length * 2000 : length;

  if (characters < 2000) return 0;
  if (characters <= 2000) return 2;
  if (characters <= 5000) return 3;
  return 5;
}
