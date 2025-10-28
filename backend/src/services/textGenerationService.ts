// backend/src/services/textGenerationService.ts
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { Text } from "@prisma/client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX || "47c4cfcb21523490f";

const LANGUAGE_MAP: Record<string, string> = {
  pl: "pl",
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  uk: "uk",
  ru: "ru",
};

async function updateTextProgress(textId: string, progress: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.text.update({
      where: { id: textId },
      data: {
        progress,
        startTime: progress === "query" ? new Date() : undefined,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Wysyłka emaila
async function sendOrderCompletedEmail(
  email: string,
  order: { orderNumber: string; texts: Array<{ topic: string }> }
) {
  try {
    const { SESv2Client, SendEmailCommand } = await import(
      "@aws-sdk/client-sesv2"
    );

    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION || "eu-north-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Tytuł zamówienia
    const firstTopic = order.texts[0]?.topic || "Zamówienie";
    const words = firstTopic.split(" ");
    const orderTitle =
      words.length <= 5 ? firstTopic : words.slice(0, 5).join(" ") + "...";

    const htmlContent = `
      <h2>Twoje zamówienie jest gotowe!</h2>
      <p>Zamówienie <strong>${orderTitle}</strong> zostało ukończone.</p>
      <p style="color: #6b7280; font-size: 14px;">(${order.orderNumber})</p>
      <p>Możesz je pobrać logując się na swoje konto:</p>
      <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
        Zobacz zamówienie
      </a>
      <p>Dziękujemy za skorzystanie z Smart-Copy.ai!</p>
    `;

    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: `${process.env.EMAIL_FROM_NAME || "Smart-Copy.ai"} <${
          process.env.EMAIL_FROM || "noreply@smart-copy.ai"
        }>`,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: {
              Data: `Zamówienie "${orderTitle}" gotowe! 🎉`,
              Charset: "UTF-8",
            },
            Body: {
              Html: { Data: htmlContent, Charset: "UTF-8" },
              Text: {
                Data: `Twoje zamówienie "${orderTitle}" (${order.orderNumber}) jest gotowe! Zaloguj się: ${process.env.FRONTEND_URL}/orders`,
                Charset: "UTF-8",
              },
            },
          },
        },
      })
    );

    console.log(`✉️ Email wysłany do ${email}`);
  } catch (error) {
    console.error("❌ Błąd wysyłki emaila:", error);
  }
}

// KROK 1: Claude generuje zapytanie do Google
export async function generateGoogleQuery(text: Text): Promise<string> {
  const languageNames: Record<string, string> = {
    pl: "polski",
    en: "angielski",
    de: "niemiecki",
    es: "hiszpański",
    fr: "francuski",
    it: "włoski",
    uk: "ukraiński",
    ru: "rosyjski",
  };

  const languageName = languageNames[text.language] || text.language;

  const prompt = `KRYTYCZNE: Twoje zapytanie musi być TYLKO w języku: ${languageName}
TEMAT: ${text.topic}
RODZAJ: ${text.textType}
WYTYCZNE: ${text.guidelines || "brak"}

ZASADY:
1. Zapytanie w języku: ${languageName.toUpperCase()}
2. Krótkie (5-7 słów)
3. TYLKO zapytanie, nic więcej
4. BEZ cudzysłowów
5. Kluczowe słowa

TWOJE ZAPYTANIE (w języku ${languageName}):`;

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 100,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  let query =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // ZAPISZ PROMPT I ODPOWIEDŹ
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.text.update({
    where: { id: text.id },
    data: {
      queryPrompt: prompt,
      queryResponse: query,
    },
  });
  await prisma.$disconnect();

  query = query
    .replace(/^(Oto zapytanie|Zapytanie|Query|Запит|Запрос)[:：]\s*/i, "")
    .replace(/^["'「『]|["'」』]$/g, "")
    .replace(/\n/g, " ")
    .trim();

  const wordCount = query.split(" ").length;
  if (wordCount > 10) {
    query = query.split(" ").slice(0, 8).join(" ");
  }

  return query;
}

// KROK 2: Wyszukiwanie w Google
export async function searchGoogle(query: string, language: string) {
  const languageCode = LANGUAGE_MAP[language] || "en";
  const allItems: any[] = [];

  for (let start = 1; start <= 11; start += 10) {
    if (allItems.length >= 15) break;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CX,
            q: query,
            num: 10,
            hl: languageCode,
            start: start,
          },
          timeout: 10000,
        }
      );

      const items = response.data.items || [];
      allItems.push(...items);

      if (items.length < 10) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      break;
    }
  }

  return {
    items: allItems.slice(0, 15),
    totalResults: allItems.length,
  };
}

// KROK 3: Claude wybiera najlepsze źródła
async function selectBestSources(text: any, searchResults: any[]) {
  const prompt = `Jesteś ekspertem od oceny jakości źródeł internetowych.

ZADANIE: Przeanalizuj poniższe źródła i wybierz 3-8 NAJLEPSZYCH do napisania tekstu.

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
JĘZYK: ${text.language}

KRYTERIA WYBORU:
1. Merytoryczność i rzetelność treści
2. Zgodność z tematem
3. Aktualność informacji
4. Poziom szczegółowości
5. Brak treści reklamowych/sprzedażowych

ZASADY:
- Wybierz minimum 3, maksimum 8 źródeł
- Im więcej dobrych źródeł, tym lepiej
- Preferuj różnorodność perspektyw

DOSTĘPNE ŹRÓDŁA:
${searchResults
  .map(
    (item, index) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ŹRÓDŁO ${index + 1}:
URL: ${item.link}
Tytuł: ${item.title}
Fragment: ${item.snippet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
  )
  .join("\n")}

ODPOWIEDŹ:
Zwróć TYLKO numery wybranych źródeł oddzielone przecinkami (np: 1,3,5,7,9)
Bez żadnego dodatkowego tekstu!`;

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 150,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const response =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // ZAPISZ PROMPT I ODPOWIEDŹ
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.text.update({
    where: { id: text.id },
    data: {
      selectPrompt: prompt,
      selectResponse: response,
    },
  });
  await prisma.$disconnect();

  const selectedNumbers = response
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n) && n > 0 && n <= searchResults.length);

  if (selectedNumbers.length === 0) {
    console.warn("⚠️ Claude nie wybrał źródeł, wybieram 3 pierwsze");
    selectedNumbers.push(1, 2, 3);
  }

  console.log(
    `✅ Claude wybrał ${selectedNumbers.length} źródeł: ${selectedNumbers.join(
      ", "
    )}`
  );

  return selectedNumbers.map((num) => searchResults[num - 1]);
}

// KROK 4: Scrapowanie URL-i
async function scrapeUrls(urls: string[]) {
  const SCRAPER_URL =
    process.env.SCRAPER_URL ||
    "http://scraper-najnowszy-env.eba-8usajxuv.eu-north-1.elasticbeanstalk.com";

  const results = [];
  const MAX_TOTAL_LENGTH = 150000;
  let currentTotalLength = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    try {
      console.log(
        `🕷️ Scrapuję [${i + 1}/${urls.length}]: ${url.substring(0, 60)}...`
      );

      const response = await axios.post(
        `${SCRAPER_URL}/scrape`,
        { url },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (response.status === 200 && response.data.text) {
        let scrapedText = response.data.text;
        const originalLength = scrapedText.length;

        // OBLICZ LIMIT DLA TEGO ŹRÓDŁA
        const remainingSources = urls.length - i;
        const remainingSpace = MAX_TOTAL_LENGTH - currentTotalLength;
        const maxForThisSource = Math.floor(remainingSpace / remainingSources);

        // PRZYTNIJ JEŚLI ZA DŁUGIE
        if (scrapedText.length > maxForThisSource) {
          scrapedText = scrapedText.substring(0, maxForThisSource);
          console.log(
            `  ✂️ Przycięto z ${originalLength} do ${maxForThisSource} znaków`
          );
        }

        currentTotalLength += scrapedText.length;

        results.push({
          url,
          text: scrapedText,
          length: scrapedText.length,
          originalLength,
          status: "success",
        });

        console.log(
          `  ✅ Zescrapowano ${scrapedText.length} znaków (łącznie: ${currentTotalLength})`
        );
      } else {
        throw new Error("Invalid scraper response");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`  ❌ Błąd scrapowania: ${error.message}`);
      results.push({
        url,
        text: "",
        length: 0,
        status: "failed",
        error: error.message,
      });
    }
  }

  console.log(`\n📊 PODSUMOWANIE SCRAPOWANIA:`);
  console.log(
    `  Zescrapowano: ${results.filter((r) => r.status === "success").length}/${
      urls.length
    }`
  );
  console.log(
    `  Łączna długość: ${currentTotalLength} / ${MAX_TOTAL_LENGTH} znaków`
  );

  return results;
}

// KROK 5: Przetwarzanie całego zamówienia
export async function processOrder(orderId: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { texts: true },
    });

    if (!order) {
      throw new Error("Zamówienie nie znalezione");
    }

    console.log(
      `\n🚀 ROZPOCZYNAM PRZETWARZANIE ZAMÓWIENIA ${order.orderNumber}`
    );

    for (const text of order.texts) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 Tekst: ${text.topic}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      try {
        // ETAP 1: Claude generuje zapytanie
        console.log("🔹 ETAP 1: Generowanie zapytania Google");
        await updateTextProgress(text.id, "query");
        const googleQuery = await generateGoogleQuery(text);
        console.log(`✅ Zapytanie: "${googleQuery}"\n`);

        // ETAP 2: Wyszukiwanie w Google
        console.log("🔹 ETAP 2: Wyszukiwanie w Google");
        await updateTextProgress(text.id, "search");
        const searchResults = await searchGoogle(googleQuery, text.language);
        console.log(`✅ Znaleziono ${searchResults.totalResults} wyników\n`);

        // ETAP 3: Claude wybiera najlepsze źródła
        console.log("🔹 ETAP 3: Claude wybiera najlepsze źródła");
        await updateTextProgress(text.id, "select");
        const selectedSources = await selectBestSources(
          text,
          searchResults.items
        );
        const selectedUrls = selectedSources.map((s: any) => s.link);
        console.log(`✅ Wybrano ${selectedUrls.length} źródeł\n`);

        // ETAP 4: Zapoznawanie się ze źródłami
        console.log("🔹 ETAP 4: Zapoznawanie się ze źródłami");
        await updateTextProgress(text.id, "reading");
        const scrapedResults = await scrapeUrls(selectedUrls);

        // ZAPISZ WSZYSTKO W BAZIE
        const contentData = {
          googleQuery,
          allSearchResults: searchResults.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })),
          selectedSources: selectedSources.map((s: any) => ({
            title: s.title,
            link: s.link,
          })),
          scrapedContent: scrapedResults.map((r) => ({
            url: r.url,
            length: r.length,
            text: r.text,
            status: r.status,
          })),
        };

        await prisma.text.update({
          where: { id: text.id },
          data: {
            content: JSON.stringify(contentData, null, 2),
          },
        });

        console.log(`\n✅ Tekst "${text.topic}" przetworzony pomyślnie!\n`);

        // GENEROWANIE TREŚCI
        console.log(`🎨 Rozpoczynam generowanie treści...`);
        await updateTextProgress(text.id, "writing");
        await generateContent(text.id);

        // Oznacz jako zakończone
        await updateTextProgress(text.id, "completed");
      } catch (error: any) {
        console.error(
          `\n❌ Błąd przetwarzania tekstu ${text.id}:`,
          error.message
        );
        await updateTextProgress(text.id, "error");
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ ZAMÓWIENIE ${order.orderNumber} PRZETWORZONE!`);

    // ZMIEŃ STATUS NA COMPLETED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    console.log(`Status: COMPLETED`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // WYŚLIJ EMAIL
    try {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
      });
      if (user) {
        await sendOrderCompletedEmail(user.email, {
          orderNumber: order.orderNumber,
          texts: order.texts.map((t) => ({ topic: t.topic })),
        });
      }
    } catch (emailError) {
      console.error("⚠️ Błąd wysyłki emaila:", emailError);
    }

    return { success: true, orderId };
  } catch (error: any) {
    console.error(`❌ BŁĄD PRZETWARZANIA ZAMÓWIENIA ${orderId}:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENEROWANIE TREŚCI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Wyciągnij źródła z Text.content
function extractSourcesFromText(text: any): string {
  try {
    if (!text.content) return "";
    const data = JSON.parse(text.content);
    return data.scrapedContent
      .filter((s: any) => s.status === "success")
      .map((s: any) => s.text)
      .join("\n\n━━━━━━━━━━━━━━━━━━\n\n");
  } catch (error) {
    return "";
  }
}

// < 10 000 znaków - bezpośrednio pisarz
async function generateShortContent(
  text: any,
  sources: string
): Promise<string> {
  const includeIntro = text.length >= 5000;
  const prompt = `Jesteś profesjonalnym copywriterem. Twoim zadaniem jest napisanie oryginalnego tekstu WYŁĄCZNIE W FORMACIE HTML.
KRYTYCZNE ZASADY FORMATOWANIA HTML:
1. Pisz TYLKO czysty HTML - bez tagów <!DOCTYPE>, <html>, <head>, <body>
2. Rozpocznij od: <h1>Tytuł Tekstu</h1>
3. ${
    includeIntro
      ? "Następnie dodaj wstęp w paragrafie: <p>Wstęp...</p>"
      : "Po tytule przejdź BEZPOŚREDNIO do treści głównej"
  }
4. Używaj nagłówków <h2>, <h3> do strukturyzacji
5. Każdy akapit w tagu <p>...</p>
6. Listy w <ul><li>...</li></ul> lub <ol><li>...</li></ol>
7. Zakończ na ostatnim znaku </p>
8. Używaj <strong> do wyróżnień, <em> do akcentów

ZASADY TREŚCI:
1. Pisz WYŁĄCZNIE w języku: ${text.language}
2. ZAKAZ kopiowania ze źródeł - wszystko własnymi słowami
3. ZAKAZ kopiowania z własnych poprzednich odpowiedzi
4. Bądź oryginalny, wartościowy, ciekawy
5. Pisz poprawnie gramatycznie

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
DŁUGOŚĆ: ${text.length} znaków (cel: ${text.length} ± 10%)
JĘZYK: ${text.language}
${
  includeIntro
    ? "STRUKTURA: Tytuł H1 → Wstęp (1 akapit) → Treść główna → Zakończenie"
    : "STRUKTURA: Tytuł H1 → Treść główna → Zakończenie"
}
WYTYCZNE: ${text.guidelines || "brak"}

ŹRÓDŁA DO WYKORZYSTANIA:
${sources}

NAPISZ ORYGINALNY TEKST W CZYSTYM HTML (zaczynając od <h1>, kończąc na </p>):`;

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  // <<<< ZAMIEŃ STARY RETURN NA NOWY KOD >>>>
  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // ZAPISZ PROMPTY I ODPOWIEDZI
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const existingText = await prisma.text.findUnique({ where: { id: text.id } });
  const existingWriterPrompts = existingText?.writerPrompts
    ? JSON.parse(existingText.writerPrompts)
    : [];
  const existingWriterResponses = existingText?.writerResponses
    ? JSON.parse(existingText.writerResponses)
    : [];

  existingWriterPrompts.push(prompt);
  existingWriterResponses.push(response);

  await prisma.text.update({
    where: { id: text.id },
    data: {
      writerPrompts: JSON.stringify(existingWriterPrompts),
      writerResponses: JSON.stringify(existingWriterResponses),
    },
  });
  await prisma.$disconnect();

  return response;
}

// >= 10 000 znaków - Kierownik określa strukturę
async function generateStructure(text: any): Promise<string> {
  const includeIntro = text.length >= 5000;

  const prompt = `Jesteś kierownikiem projektu content. Określ strukturę i spis treści dla tekstu W FORMACIE HTML.

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
DŁUGOŚĆ: ${text.length} znaków
JĘZYK: ${text.language}
WYTYCZNE: ${text.guidelines || "brak"}

FORMAT WYJŚCIOWY: Czysty HTML (bez <!DOCTYPE>, <html>, <body>)

ZADANIE:
Przygotuj szczegółową strukturę HTML. Określ:

1. TYTUŁ GŁÓWNY (w <h1>)
${
  includeIntro
    ? "2. WSTĘP (1 akapit, ok. 300-500 znaków) - w <p>"
    : "2. BEZ WSTĘPU - przejdź bezpośrednio do treści"
}
${includeIntro ? "3." : "2."} SEKCJE GŁÓWNE (w <h2>) z podsekcjami (w <h3>)
   - Określ ile znaków każda sekcja
   - Jakie punkty kluczowe
${includeIntro ? "4." : "3."} ZAKOŃCZENIE (w <p>)
${includeIntro ? "5." : "4."} Ton komunikacji
${includeIntro ? "6." : "5."} Elementy HTML: <strong>, <em>, <ul>, <ol>

STRUKTURA:
<h1>Tytuł Główny</h1>
${includeIntro ? "<p>Wstęp wprowadzający... (300-500 znaków)</p>" : ""}

<h2>Sekcja 1 (X znaków)</h2>
<p>Treść sekcji 1...</p>

<h3>Podsekcja 1.1 (Y znaków)</h3>
<p>Treść podsekcji...</p>

[...więcej sekcji...]

<p>Zakończenie podsumowujące...</p>

Struktura musi sumować się do ${text.length} znaków (±10%).

ODPOWIEDŹ - szczegółowa struktura HTML:`;

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4000,
    temperature: 0.5,
    messages: [{ role: "user", content: prompt }],
  });
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.text.update({
    where: { id: text.id },
    data: {
      structurePrompt: prompt,
      structureResponse:
        message.content[0].type === "text" ? message.content[0].text : "",
    },
  });
  await prisma.$disconnect();
  return message.content[0].type === "text" ? message.content[0].text : "";
}

// Pisarz - generuje treść na podstawie struktury
async function generateWithStructure(
  text: any,
  structure: string,
  sources: string,
  part?: { number: number; total: number; previousContent?: string }
): Promise<string> {
  const partInfo = part
    ? `PISZESZ CZĘŚĆ ${part.number} z ${part.total}
${
  part.previousContent
    ? `\nPOPRZEDNIA CZĘŚĆ (ostatnie 5000 znaków):\n${part.previousContent.substring(
        Math.max(0, part.previousContent.length - 5000)
      )}\n\nKONTYNUUJ PŁYNNIE od tego miejsca:`
    : ""
}`
    : "";
  const includeIntro = text.length >= 5000;
  const prompt = `Jesteś profesjonalnym copywriterem. ${partInfo}
KRYTYCZNE ZASADY FORMATOWANIA HTML:
1. Pisz TYLKO czysty HTML - bez tagów <!DOCTYPE>, <html>, <head>, <body>
2. ${
    part?.number === 1
      ? "Rozpocznij od: <h1>Tytuł Tekstu</h1>"
      : "Kontynuuj strukturę HTML od poprzedniej części"
  }
3. ${
    includeIntro && part?.number === 1
      ? "Po tytule dodaj wstęp: <p>Wstęp...</p>"
      : part?.number === 1
      ? "Po tytule przejdź BEZPOŚREDNIO do treści"
      : ""
  }
4. Używaj nagłówków <h2>, <h3> do strukturyzacji
5. Każdy akapit w tagu <p>...</p>
6. Listy w <ul><li>...</li></ul> lub <ol><li>...</li></ol>
7. ${
    part?.number === part?.total
      ? "Zakończ na ostatnim znaku </p>"
      : "Zakończ część na pełnym znaczniku (np. </p>, </li>, </ul>)"
  }
8. Używaj <strong> do wyróżnień, <em> do akcentów

ZASADY TREŚCI:
1. Pisz WYŁĄCZNIE w języku: ${text.language}
2. ZAKAZ kopiowania ze źródeł
3. ZAKAZ kopiowania z własnych poprzednich odpowiedzi
4. Bądź oryginalny, wartościowy, ciekawy
5. Ścisłe trzymanie się struktury HTML
${
  part
    ? `6. ${
        part.previousContent
          ? "KONTYNUUJ poprzednią część płynnie - NIE powtarzaj treści"
          : "To jest pierwsza część - rozpocznij od <h1>"
      }`
    : ""
}

STRUKTURA HTML DO REALIZACJI:
${structure}

ŹRÓDŁA:
${sources.substring(0, 50000)}

${
  part
    ? `NAPISZ CZĘŚĆ ${part.number}/${part.total} W CZYSTYM HTML:`
    : "NAPISZ PEŁNY TEKST W CZYSTYM HTML:"
}`;

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  // <<<< TUTAJ ZAMIEŃ TEN RETURN NA KOD PONIŻEJ >>>>
  // STARY KOD (usuń):
  // return message.content[0].type === "text" ? message.content[0].text : "";

  // NOWY KOD:
  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // ZAPISZ PROMPTY I ODPOWIEDZI
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const existingText = await prisma.text.findUnique({ where: { id: text.id } });
  const existingWriterPrompts = existingText?.writerPrompts
    ? JSON.parse(existingText.writerPrompts)
    : [];
  const existingWriterResponses = existingText?.writerResponses
    ? JSON.parse(existingText.writerResponses)
    : [];

  existingWriterPrompts.push(prompt);
  existingWriterResponses.push(response);

  await prisma.text.update({
    where: { id: text.id },
    data: {
      writerPrompts: JSON.stringify(existingWriterPrompts),
      writerResponses: JSON.stringify(existingWriterResponses),
    },
  });
  await prisma.$disconnect();

  return response;
}

// Główna funkcja generowania treści
export async function generateContent(textId: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const text = await prisma.text.findUnique({ where: { id: textId } });
    if (!text) throw new Error("Text nie znaleziony");

    console.log(`\n🎨 GENEROWANIE TREŚCI HTML: ${text.topic}`);
    console.log(`📏 Długość: ${text.length} znaków`);
    console.log(`${text.length >= 5000 ? "📝 Z WSTĘPEM" : "📝 BEZ WSTĘPU"}`);

    const sources = extractSourcesFromText(text);
    if (!sources) throw new Error("Brak źródeł");

    let finalContent = "";

    // ŚCIEŻKA 1: < 10 000 znaków - bezpośrednio pisarz
    if (text.length < 10000) {
      console.log("📝 Tryb: Bezpośrednie pisanie HTML (< 10k znaków)");
      finalContent = await generateShortContent(text, sources);
      console.log(`✅ Wygenerowano ${finalContent.length} znaków HTML`);
    }
    // ŚCIEŻKA 2: 10 000 - 50 000 znaków - kierownik + pisarz
    else if (text.length < 50000) {
      console.log("📝 Tryb: Kierownik + Pisarz HTML (10k-50k znaków)");
      console.log("🔹 Kierownik: Tworzenie struktury HTML...");
      const structure = await generateStructure(text);
      console.log(`✅ Struktura HTML utworzona`);

      console.log("🔹 Pisarz: Generowanie treści HTML...");
      finalContent = await generateWithStructure(text, structure, sources);
      console.log(`✅ Wygenerowano ${finalContent.length} znaków HTML`);
    }
    // ŚCIEŻKA 3: 50 000 - 100 000 znaków - kierownik + 2 pisarzy
    else if (text.length < 100000) {
      console.log("📝 Tryb: Kierownik + 2 Pisarzy HTML (50k-100k znaków)");
      console.log("🔹 Kierownik: Tworzenie struktury HTML...");
      const structure = await generateStructure(text);
      console.log(`✅ Struktura HTML utworzona`);

      console.log("🔹 Pisarz 1/2: Generowanie części 1 HTML...");
      const part1 = await generateWithStructure(text, structure, sources, {
        number: 1,
        total: 2,
      });
      console.log(`✅ Część 1: ${part1.length} znaków HTML`);

      console.log("🔹 Pisarz 2/2: Generowanie części 2 HTML...");
      const part2 = await generateWithStructure(text, structure, sources, {
        number: 2,
        total: 2,
        previousContent: part1,
      });
      console.log(`✅ Część 2: ${part2.length} znaków HTML`);

      finalContent = part1 + "\n\n" + part2;
      console.log(`✅ Łącznie: ${finalContent.length} znaków HTML`);
    }
    // ŚCIEŻKA 4: 100 000 - 150 000 znaków - kierownik + 3 pisarzy
    else {
      console.log("📝 Tryb: Kierownik + 3 Pisarzy HTML (100k-150k znaków)");
      console.log("🔹 Kierownik: Tworzenie struktury HTML...");
      const structure = await generateStructure(text);
      console.log(`✅ Struktura HTML utworzona`);

      console.log("🔹 Pisarz 1/3: Generowanie części 1 HTML...");
      const part1 = await generateWithStructure(text, structure, sources, {
        number: 1,
        total: 3,
      });
      console.log(`✅ Część 1: ${part1.length} znaków HTML`);

      console.log("🔹 Pisarz 2/3: Generowanie części 2 HTML...");
      const part2 = await generateWithStructure(text, structure, sources, {
        number: 2,
        total: 3,
        previousContent: part1,
      });
      console.log(`✅ Część 2: ${part2.length} znaków HTML`);

      console.log("🔹 Pisarz 3/3: Generowanie części 3 HTML...");
      const part3 = await generateWithStructure(text, structure, sources, {
        number: 3,
        total: 3,
        previousContent: part1 + "\n\n" + part2,
      });
      console.log(`✅ Część 3: ${part3.length} znaków HTML`);

      finalContent = part1 + "\n\n" + part2 + "\n\n" + part3;
      console.log(`✅ Łącznie: ${finalContent.length} znaków HTML`);
    }

    // Zapisz wygenerowaną treść
    const existingData = JSON.parse(text.content || "{}");
    existingData.generatedContent = finalContent;
    existingData.generatedAt = new Date().toISOString();

    await prisma.text.update({
      where: { id: textId },
      data: { content: JSON.stringify(existingData, null, 2) },
    });

    console.log(`✅ TREŚĆ HTML "${text.topic}" WYGENEROWANA!\n`);
    return finalContent;
  } catch (error: any) {
    console.error(`❌ Błąd generowania treści:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function savePromptAndResponse(
  textId: string,
  field: string,
  prompt: string,
  response: string
) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.text.update({
      where: { id: textId },
      data: { [field]: { prompt, response: response } },
    });
  } finally {
    await prisma.$disconnect();
  }
}
