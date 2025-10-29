// backend/src/services/textGenerationService.ts
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { Text } from "@prisma/client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX || "47c4cfcb21523490f";

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 TWARDY LIMIT TOKENÓW - ZAPOBIEGA PRZEKROCZENIU DŁUGOŚCI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function calculateMaxTokens(targetLength: number): number {
  // 1 token ≈ 4 znaki dla języków łacińskich (en, pl, de, es, fr, it)
  // Dla języków ze znakami specjalnymi (uk, ru) może być 1:3
  const baseTokens = Math.ceil(targetLength / 3.5);

  // Margines 20% (Claude często pisze więcej niż trzeba)
  const withMargin = Math.ceil(baseTokens * 1.2);

  // Limity bezpieczeństwa
  const MIN_TOKENS = 300;
  const MAX_TOKENS = 16000;

  const finalTokens = Math.max(MIN_TOKENS, Math.min(MAX_TOKENS, withMargin));

  console.log(`📊 KALKULACJA MAX_TOKENS:`);
  console.log(`   Target: ${targetLength} znaków`);
  console.log(`   Bazowe tokeny (÷3.5): ${baseTokens}`);
  console.log(`   Z marginesem (+20%): ${withMargin}`);
  console.log(`   🔒 FINAL: ${finalTokens} tokenów\n`);

  return finalTokens;
}

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
      region: process.env.AWS_REGION_MAIL || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Tytuł zamówienia
    const firstTopic = order.texts[0]?.topic || "Zamówienie";
    const words = firstTopic.split(" ");
    const rawTitle =
      words.length <= 5 ? firstTopic : words.slice(0, 5).join(" ") + "...";
    const orderTitle = capitalizeFirstLetter(rawTitle);

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
    model: "claude-sonnet-4-5-20250929",
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
    if (allItems.length >= 10) break;

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
    model: "claude-sonnet-4-5-20250929",
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

// KROK 4: Scrapowanie URL-i - ZAKTUALIZOWANA WERSJA Z DOKŁADNYM LOGOWANIEM
async function scrapeUrls(urls: string[], isUserSource: boolean = false) {
  const SCRAPER_URL =
    process.env.SCRAPER_URL ||
    "http://scraper-najnowszy-env.eba-8usajxuv.eu-north-1.elasticbeanstalk.com";
  const results = [];
  const MAX_TOTAL_LENGTH = isUserSource ? 200000 : 150000;
  let currentTotalLength = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(
        `🕷️ Scrapuję ${isUserSource ? "[USER SOURCE]" : ""} [${i + 1}/${
          urls.length
        }]: ${url.substring(0, 60)}...`
      );

      // 🔹 DODANE: Logowanie requestu
      console.log(`📤 Wysyłam POST do: ${SCRAPER_URL}/scrape`);
      console.log(`📤 Payload: ${JSON.stringify({ url })}`);

      const response = await axios.post(
        `${SCRAPER_URL}/scrape`,
        { url },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 100000,
        }
      );

      // 🔹 DODANE: Logowanie pełnej odpowiedzi
      console.log(`📥 Status: ${response.status}`);
      console.log(
        `📥 Response data keys: ${Object.keys(response.data).join(", ")}`
      );
      console.log(
        `📥 Response.data.text length: ${response.data.text?.length || 0}`
      );

      // 🔹 DODANE: Pokaż pierwsze 500 znaków
      if (response.data.text) {
        console.log(
          `📥 Pierwsze 500 znaków:\n${response.data.text.substring(0, 500)}`
        );
      }

      // 🔹 DODANE: Pokaż cały response jeśli krótki (< 200 znaków)
      if (response.data.text && response.data.text.length < 200) {
        console.log(
          `⚠️ UWAGA: Bardzo krótka odpowiedź!\n📥 Cała odpowiedź:\n${response.data.text}`
        );
      }

      if (response.status === 200 && response.data.text) {
        let scrapedText = response.data.text;
        const originalLength = scrapedText.length;

        const remainingSources = urls.length - i;
        const remainingSpace = MAX_TOTAL_LENGTH - currentTotalLength;
        const maxForThisSource = Math.floor(remainingSpace / remainingSources);

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
          isUserSource,
        });

        console.log(
          `  ✅ Zescrapowano ${scrapedText.length} znaków (łącznie: ${currentTotalLength})`
        );
      } else {
        // 🔹 DODANE: Lepsze logowanie błędów
        console.error(`  ❌ Invalid response - status: ${response.status}`);
        console.error(`  ❌ Response data: ${JSON.stringify(response.data)}`);
        throw new Error("Invalid scraper response");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      // 🔹 DODANE: Szczegółowe logowanie błędów
      console.error(`  ❌ Błąd scrapowania: ${error.message}`);

      if (error.response) {
        console.error(`  ❌ Response status: ${error.response.status}`);
        console.error(
          `  ❌ Response data: ${JSON.stringify(error.response.data)}`
        );
      }

      if (error.code === "ECONNABORTED") {
        console.error(`  ❌ Timeout - scraper nie odpowiedział w 30s`);
      }

      results.push({
        url,
        text: "",
        length: 0,
        status: "failed",
        error: error.message,
        isUserSource,
      });
    }
  }

  console.log(
    `\n📊 PODSUMOWANIE SCRAPOWANIA ${
      isUserSource ? "[USER SOURCES]" : "[GOOGLE]"
    }:`
  );
  console.log(
    `  Zescrapowano: ${results.filter((r) => r.status === "success").length}/${
      urls.length
    }`
  );
  console.log(
    `  Łączna długość: ${currentTotalLength} / ${MAX_TOTAL_LENGTH} znaków`
  );

  // 🔹 DODANE: Wyświetl szczegóły każdego źródła
  console.log(`\n📋 SZCZEGÓŁY KAŻDEGO ŹRÓDŁA:`);
  results.forEach((r, idx) => {
    console.log(`\n  [${idx + 1}] ${r.url}`);
    console.log(`      Status: ${r.status}`);
    console.log(`      Długość: ${r.length} znaków`);
    if (r.status === "success" && r.length < 500) {
      console.log(`      ⚠️ Zescrapowano mało! Treść:\n      ${r.text}`);
    }
  });

  return results;
}

// KROK 5: Przetwarzanie całego zamówienia - ZAKTUALIZOWANE
export async function processOrder(orderId: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { texts: true },
    });

    if (!order) throw new Error("Zamówienie nie znalezione");

    console.log(
      `\n🚀 ROZPOCZYNAM PRZETWARZANIE ZAMÓWIENIA ${order.orderNumber}`
    );

    for (const text of order.texts) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 Tekst: ${text.topic}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      try {
        // ═══ ŹRÓDŁA UŻYTKOWNIKA (bez zmian) ═══
        let userSourcesData: any = null;
        let userSourcesScrapeResults: any[] = [];
        let userSourcesTotalLength = 0;

        if (text.userSources) {
          try {
            userSourcesData = JSON.parse(text.userSources);
            console.log("🔹 ŹRÓDŁA UŻYTKOWNIKA:");
            console.log(`  URLs: ${userSourcesData.urls?.length || 0}`);
            console.log(`  Pliki: ${userSourcesData.files?.length || 0}`);

            if (userSourcesData.urls && userSourcesData.urls.length > 0) {
              console.log("\n🔸 Scrapowanie URL-i użytkownika...");
              await updateTextProgress(text.id, "user-sources-urls");
              const urlResults = await scrapeUrls(userSourcesData.urls, true);
              userSourcesScrapeResults.push(...urlResults);
              userSourcesTotalLength = urlResults
                .filter((r: any) => r.status === "success")
                .reduce((sum: number, r: any) => sum + r.length, 0);
            }

            if (userSourcesData.files && userSourcesData.files.length > 0) {
              console.log("\n🔸 Scrapowanie plików użytkownika...");
              await updateTextProgress(text.id, "user-sources-files");
              const fileUrls = userSourcesData.files.map((f: any) => f.url);
              const fileResults = await scrapeUrls(fileUrls, true);
              userSourcesScrapeResults.push(...fileResults);
              const filesLength = fileResults
                .filter((r: any) => r.status === "success")
                .reduce((sum: number, r: any) => sum + r.length, 0);
              userSourcesTotalLength += filesLength;
            }

            console.log(
              `\n📊 ŁĄCZNA DŁUGOŚĆ ŹRÓDEŁ UŻYTKOWNIKA: ${userSourcesTotalLength} znaków\n`
            );
          } catch (error) {
            console.error("⚠️ Błąd przetwarzania źródeł użytkownika:", error);
          }
        }

        // ═══ GOOGLE SOURCES - NOWA KOLEJNOŚĆ ═══
        const USE_GOOGLE = userSourcesTotalLength < 200000;
        let googleQuery = "";
        let searchResults: any = { items: [], totalResults: 0 };
        let allGoogleScraped: any[] = [];
        let selectedGoogleSources: any[] = [];

        if (USE_GOOGLE) {
          // ETAP 1: Generowanie zapytania
          console.log("🔹 ETAP 1: Generowanie zapytania Google");
          await updateTextProgress(text.id, "query");
          googleQuery = await generateGoogleQuery(text);
          console.log(`✅ Zapytanie: "${googleQuery}"\n`);

          // ETAP 2: Wyszukiwanie
          console.log("🔹 ETAP 2: Wyszukiwanie w Google");
          await updateTextProgress(text.id, "search");
          searchResults = await searchGoogle(googleQuery, text.language);
          console.log(`✅ Znaleziono ${searchResults.totalResults} wyników\n`);

          // ✨ NOWY ETAP 3: SCRAPUJ WSZYSTKIE 10-20 ŹRÓDEŁ
          console.log("🔹 ETAP 3: Scrapowanie WSZYSTKICH źródeł z Google");
          await updateTextProgress(text.id, "scraping-all");

          const allUrls = searchResults.items.map((item: any) => item.link);
          allGoogleScraped = await scrapeUrls(allUrls, false);

          // Filtruj tylko poprawne (> 500 znaków, bez błędów)
          const validScraped = allGoogleScraped.filter(
            (r: any) =>
              r.status === "success" &&
              r.length > 500 &&
              !r.text.includes("403 Client Error") &&
              !r.text.includes("SSL Error")
          );

          console.log(
            `✅ Poprawnie zescrapowano: ${validScraped.length}/${allGoogleScraped.length}\n`
          );

          // ✨ NOWY ETAP 4: CLAUDE WYBIERA (na podstawie TREŚCI)
          console.log(
            "🔹 ETAP 4: Claude wybiera najlepsze źródła (na podstawie zescrapowanych treści)"
          );
          await updateTextProgress(text.id, "selecting");

          if (validScraped.length > 0) {
            selectedGoogleSources = await selectBestSourcesFromScraped(
              text,
              validScraped
            );
            console.log(
              `✅ Wybrano ${selectedGoogleSources.length} źródeł do pisania\n`
            );
          } else {
            console.warn(
              "⚠️ Brak poprawnych źródeł z Google - tylko źródła użytkownika\n"
            );
          }
        } else {
          console.log(
            "✅ Źródła użytkownika w pełni wykorzystane (200,000 znaków)"
          );
          console.log(
            "ℹ️  Pomijam wyszukiwanie Google - źródła użytkownika wystarczają\n"
          );
        }

        // ═══ POŁĄCZ WYBRANE ŹRÓDŁA ═══
        const allScrapedResults = [
          ...userSourcesScrapeResults.filter(
            (r: any) => r.status === "success"
          ),
          ...selectedGoogleSources,
        ];

        // 🔹 DODAJ WERYFIKACJĘ
        const userSourcesCount = allScrapedResults.filter(
          (r: any) => r.isUserSource
        ).length;
        const userSourcesLength = allScrapedResults
          .filter((r: any) => r.isUserSource)
          .reduce((sum: number, r: any) => sum + r.length, 0);

        console.log("📊 FINALNE ŹRÓDŁA DO GENEROWANIA TREŚCI:");
        console.log(
          `  ✅ Źródła użytkownika: ${userSourcesCount} (${userSourcesLength.toLocaleString()} znaków)`
        );
        console.log(
          `  ✅ Źródła z Google: ${
            selectedGoogleSources.length
          } (${selectedGoogleSources
            .reduce((sum: number, s: any) => sum + s.length, 0)
            .toLocaleString()} znaków)`
        );
        console.log(
          `  ✅ RAZEM: ${allScrapedResults.length} źródeł (${allScrapedResults
            .reduce((sum: number, r: any) => sum + r.length, 0)
            .toLocaleString()} znaków)\n`
        );

        // Upewnij się że mamy źródła
        if (allScrapedResults.length === 0) {
          throw new Error(
            "❌ KRYTYCZNY BŁĄD: Brak źródeł do generowania treści!"
          );
        }

        // ZAPISZ W BAZIE
        const contentData = {
          googleQuery,
          allSearchResults: searchResults.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })),
          allGoogleScraped: allGoogleScraped.map((r: any) => ({
            url: r.url,
            length: r.length,
            status: r.status,
          })),
          selectedGoogleSources: selectedGoogleSources.map((s: any) => ({
            url: s.url,
            length: s.length,
          })),
          userSources: userSourcesData || null,
          userSourcesScraped: userSourcesScrapeResults.map((r) => ({
            url: r.url,
            length: r.length,
            status: r.status,
          })),
          scrapedContent: allScrapedResults.map((r) => ({
            url: r.url,
            length: r.length,
            text: r.text,
            status: r.status,
            isUserSource: r.isUserSource || false,
          })),
        };

        await prisma.text.update({
          where: { id: text.id },
          data: { content: JSON.stringify(contentData, null, 2) },
        });

        console.log(`\n✅ Tekst "${text.topic}" przetworzony!\n`);

        // GENEROWANIE TREŚCI
        console.log(`🎨 Rozpoczynam generowanie treści...`);
        await updateTextProgress(text.id, "writing");
        await generateContent(text.id);

        await updateTextProgress(text.id, "completed");
      } catch (error: any) {
        console.error(`\n❌ Błąd: ${text.id}:`, error.message);
        await updateTextProgress(text.id, "error");
      }
    }

    console.log(`\n✅ ZAMÓWIENIE ${order.orderNumber} PRZETWORZONE!`);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    // Email...
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
      console.error("⚠️ Błąd emaila:", emailError);
    }

    return { success: true, orderId };
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
    if (!text.content) {
      console.error("⚠️ text.content jest puste!");
      return "";
    }

    const data = JSON.parse(text.content);

    if (!data.scrapedContent || data.scrapedContent.length === 0) {
      console.error("⚠️ data.scrapedContent jest puste!");
      return "";
    }

    console.log(
      `\n🔍 Ekstrakcja źródeł z text.content (${data.scrapedContent.length} źródeł)...`
    );

    // PRIORYTET: najpierw źródła użytkownika, potem Google
    const userSourcesArray = (data.scrapedContent || []).filter(
      (s: any) => s.status === "success" && s.isUserSource === true
    );

    const googleSourcesArray = (data.scrapedContent || []).filter(
      (s: any) => s.status === "success" && s.isUserSource !== true
    );

    console.log(`  ✅ Źródła użytkownika: ${userSourcesArray.length}`);
    console.log(`  ✅ Źródła z Google: ${googleSourcesArray.length}`);

    const userSources = userSourcesArray
      .map((s: any) => s.text)
      .join("\n\n━━━━━━━━━━━━━━━━━━\n\n");

    const googleSources = googleSourcesArray
      .map((s: any) => s.text)
      .join("\n\n━━━━━━━━━━━━━━━━━━\n\n");

    if (userSourcesArray.length > 0) {
      console.log(
        `  📊 Łączna długość źródeł użytkownika: ${userSources.length.toLocaleString()} znaków`
      );
    }
    if (googleSourcesArray.length > 0) {
      console.log(
        `  📊 Łączna długość źródeł Google: ${googleSources.length.toLocaleString()} znaków`
      );
    }

    // Połącz z oznaczeniem
    let combined = "";
    if (userSources) {
      combined +=
        "═══ ŹRÓDŁA PRIORYTETOWE (WSKAZANE PRZEZ UŻYTKOWNIKA) ═══\n\n";
      combined += userSources;
    }
    if (googleSources) {
      if (combined) combined += "\n\n";
      combined += "═══ ŹRÓDŁA DODATKOWE (Z GOOGLE) ═══\n\n";
      combined += googleSources;
    }

    if (!combined) {
      console.error("❌ KRYTYCZNY BŁĄD: Brak źródeł do zwrócenia!");
    }

    return combined;
  } catch (error) {
    console.error("❌ Błąd w extractSourcesFromText:", error);
    return "";
  }
}

// < 10 000 znaków - bezpośrednio pisarz
async function generateShortContent(
  text: any,
  sources: string
): Promise<string> {
  const includeIntro = text.length >= 5000;
  const hasUserSources = sources.includes("ŹRÓDŁA PRIORYTETOWE");

  // 🔒 BARDZO RESTRYKCYJNY max_tokens (bez marginesu!)
  const maxTokens = Math.ceil(text.length / 4); // 1:4 ratio, BEZ marginesu

  const minLength = Math.floor(text.length * 0.95);
  const maxLength = Math.ceil(text.length * 1.05);

  const prompt = `╔═══════════════════════════════════════════════════════════════╗
║  🔴 ABSOLUTNY WYMÓG: DOKŁADNA DŁUGOŚĆ TEKSTU 🔴              ║
╚═══════════════════════════════════════════════════════════════╝

🔴🔴🔴 LIMIT: ${text.length} ZNAKÓW (±5%) 🔴🔴🔴
      MINIMUM: ${minLength} znaków
      MAXIMUM: ${maxLength} znaków

⚠️ PRZEKROCZENIE = CAŁKOWITA PORAŻKA! ⚠️
⚠️ NIE BĘDZIE DRUGIEJ SZANSY! ⚠️

═══════════════════════════════════════════════════════════════

Jesteś profesjonalnym copywriterem. Piszesz HTML.

KRYTYCZNE ZASADY FORMATOWANIA HTML:
1. Pisz TYLKO czysty HTML - bez <!DOCTYPE>, <html>, <head>, <body>
2. Rozpocznij od: <h1>Tytuł Tekstu</h1>
3. ${
    includeIntro
      ? "Następnie wstęp: <p>Wstęp...</p>"
      : "Po tytule BEZPOŚREDNIO treść główna"
  }
4. Używaj <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>
5. Zakończ na </p> - MUSISZ zakończyć tekst sensownie!

═══════════════════════════════════════════════════════════════
⚠️ STRATEGIA PISANIA DLA ${text.length} ZNAKÓW:
═══════════════════════════════════════════════════════════════

${
  text.length <= 2000
    ? `
🔹 To BARDZO KRÓTKI tekst (${text.length} znaków)
🔹 <h1> + 2-3 KRÓTKIE akapity + zakończenie
🔹 Każdy akapit: ~${Math.floor(text.length / 5)}-${Math.floor(
        text.length / 4
      )} znaków
🔹 BEZ rozwijania myśli - TYLKO esencja!
🔹 ZWIĘŹLE! Każde słowo musi być potrzebne!
🔹 PRZESTAŃ PISAĆ gdy osiągniesz ~${text.length} znaków!
`
    : text.length <= 5000
    ? `
🔹 To ŚREDNI tekst (${text.length} znaków)
🔹 <h1> + 2-3 sekcje <h2> + zakończenie
🔹 Każda sekcja: ~${Math.floor(text.length / 5)} znaków
🔹 Nie rozwijaj zbytnio - trzymaj się tematu!
`
    : `
🔹 To DŁUŻSZY tekst (${text.length} znaków)
🔹 <h1> + wstęp + 3-4 sekcje <h2> z podsekcjami <h3>
🔹 Rozwijaj myśli, ale kontroluj długość!
`
}

⚠️ KRYTYCZNE: Gdy zbliżasz się do ${text.length} znaków:
   - Zacznij kończyć tekst
   - Dodaj krótkie podsumowanie w <p>
   - Zamknij wszystkie tagi
   - PRZESTAŃ PISAĆ!

═══════════════════════════════════════════════════════════════

PARAMETRY:
- TEMAT: ${text.topic}
- RODZAJ: ${text.textType}
- 🔴 DŁUGOŚĆ: ${text.length} znaków (${minLength}-${maxLength}) 🔴
- JĘZYK: ${text.language}
${
  includeIntro
    ? "- STRUKTURA: H1 → Wstęp → Treść → Zakończenie"
    : "- STRUKTURA: H1 → Treść → Zakończenie"
}
- WYTYCZNE: ${text.guidelines || "brak"}

═══════════════════════════════════════════════════════════════

ZASADY TREŚCI:
1. Pisz WYŁĄCZNIE w języku: ${text.language}
2. ZAKAZ kopiowania ze źródeł - własne słowa
3. ZAKAZ powtórzeń z poprzednich odpowiedzi
4. Oryginalny, wartościowy, ciekawy
5. 🔴 LICZY SIĘ KAŻDY ZNAK - KONTROLUJ DŁUGOŚĆ! 🔴
6. 🔴 MUSISZ zakończyć tekst sensownie - nie przerywaj w połowie! 🔴

${
  hasUserSources
    ? `
⚠️ KRYTYCZNE: PRIORYTET DLA ŹRÓDEŁ UŻYTKOWNIKA
- Użytkownik wskazał konkretne materiały
- Wykorzystaj JE W PIERWSZEJ KOLEJNOŚCI
- Źródła Google tylko uzupełnieniem
`
    : ""
}

═══════════════════════════════════════════════════════════════
${hasUserSources ? "MATERIAŁY ŹRÓDŁOWE (UŻYTKOWNIK + GOOGLE):" : "ŹRÓDŁA:"}
═══════════════════════════════════════════════════════════════

${sources}

═══════════════════════════════════════════════════════════════
🔴 OSTATNIE PRZYPOMNIENIE:
═══════════════════════════════════════════════════════════════

TWÓJ TEKST MUSI MIEĆ: ${text.length} znaków (±5%)
- Mniej niż ${minLength}: ❌ ZA KRÓTKI
- Więcej niż ${maxLength}: ❌ ZA DŁUGI
- W zakresie ${minLength}-${maxLength}: ✅ IDEALNE

LEPIEJ NIECO KRÓCEJ NIŻ ZA DŁUGO!
LEPIEJ TEKST ZAKOŃCZONY SENSOWNIE NIŻ URWANY W POŁOWIE!

PISZ ZWIĘŹLE, NA TEMAT, I ZAKOŃCZ PORZĄDNIE!

NAPISZ TEKST W CZYSTYM HTML (${minLength}-${maxLength} znaków):`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens, // 🔒 BARDZO RESTRYKCYJNY LIMIT
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // 🔒 TYLKO LOGOWANIE - BEZ PRZYCINANIA!
  const actualLength = response.length;
  console.log(`\n📏 WERYFIKACJA DŁUGOŚCI:`);
  console.log(`   Oczekiwano: ${text.length} ±5% (${minLength}-${maxLength})`);
  console.log(`   Otrzymano: ${actualLength} znaków`);

  if (actualLength > maxLength) {
    console.error(`❌ TEKST ZA DŁUGI! (${actualLength} > ${maxLength})`);
    console.error(`   Przekroczenie o: ${actualLength - maxLength} znaków`);
    // ⚠️ BEZ PRZYCINANIA - zwracamy taki jaki jest
    // Użytkownik zobaczy problem i będzie mógł zlecić ponownie
  } else if (actualLength < minLength) {
    console.warn(`⚠️ TEKST ZA KRÓTKI! (${actualLength} < ${minLength})`);
    console.warn(`   Brakuje: ${minLength - actualLength} znaków`);
  } else {
    console.log(`   ✅ DŁUGOŚĆ OK!\n`);
  }

  // ZAPISZ PROMPTY
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

  return response; // Zwracamy pełny tekst, nawet jeśli za długi
}

// >= 10 000 znaków - Kierownik określa strukturę
async function generateStructure(text: any): Promise<string> {
  const includeIntro = text.length >= 5000;
  // Sprawdź czy są źródła użytkownika
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
    model: "claude-sonnet-4-5-20250929",
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
      )}\n\nKONTYNUUJ PŁYNNIE:`
    : ""
}`
    : "";

  const includeIntro = text.length >= 5000;
  const hasUserSources = sources.includes("ŹRÓDŁA PRIORYTETOWE");

  // 🔒 OBLICZ DŁUGOŚĆ DLA TEJ CZĘŚCI
  const partLength = part ? Math.floor(text.length / part.total) : text.length;
  const maxTokens = calculateMaxTokens(partLength);
  const minLength = Math.floor(partLength * 0.9); // trochę luźniej dla części
  const maxLength = Math.ceil(partLength * 1.1);

  const prompt = `╔═══════════════════════════════════════════════════════════════╗
║  🔴 ABSOLUTNY WYMÓG: DOKŁADNA DŁUGOŚĆ ${
    part ? `CZĘŚCI ${part.number}` : "TEKSTU"
  } 🔴  ║
╚═══════════════════════════════════════════════════════════════╝

${partInfo}

🔴🔴🔴 LIMIT TEJ CZĘŚCI: ${partLength} ZNAKÓW (±10%) 🔴🔴🔴
      MINIMUM: ${minLength} znaków
      MAXIMUM: ${maxLength} znaków

⚠️ PRZEKROCZENIE = ZADANIE NIEUDANE! ⚠️

═══════════════════════════════════════════════════════════════

KRYTYCZNE ZASADY FORMATOWANIA HTML:
1. Pisz TYLKO czysty HTML - bez <!DOCTYPE>, <html>, <head>, <body>
2. ${
    part?.number === 1
      ? "Rozpocznij od: <h1>Tytuł</h1>"
      : "Kontynuuj od poprzedniej części"
  }
3. ${
    includeIntro && part?.number === 1
      ? "Po tytule wstęp: <p>Wstęp...</p>"
      : part?.number === 1
      ? "Po tytule BEZPOŚREDNIO treść"
      : ""
  }
4. Używaj <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>
5. ${
    part?.number === part?.total
      ? "Zakończ na </p>"
      : "Zakończ na pełnym tagu (</p>, </li>, </ul>)"
  }

ZASADY TREŚCI:
1. Język: ${text.language}
2. ZAKAZ kopiowania ze źródeł
3. ZAKAZ powtórzeń
4. Oryginalny, wartościowy
5. Ścisłe trzymanie struktury HTML
6. 🔴 KONTROLUJ DŁUGOŚĆ - ${partLength} znaków! 🔴

${
  hasUserSources
    ? `
⚠️ PRIORYTET: ŹRÓDŁA UŻYTKOWNIKA
- Użyj ich W PIERWSZEJ KOLEJNOŚCI
- Google tylko uzupełnienie
`
    : ""
}

${
  part
    ? `6. ${
        part.previousContent
          ? "KONTYNUUJ płynnie - NIE powtarzaj"
          : "To pierwsza część - zacznij od <h1>"
      }`
    : ""
}

═══════════════════════════════════════════════════════════════
STRUKTURA HTML DO REALIZACJI:
═══════════════════════════════════════════════════════════════

${structure}

═══════════════════════════════════════════════════════════════
${hasUserSources ? "MATERIAŁY (UŻYTKOWNIK + GOOGLE):" : "ŹRÓDŁA:"}
═══════════════════════════════════════════════════════════════

${sources.substring(0, 50000)}

═══════════════════════════════════════════════════════════════
🔴 PRZYPOMNIENIE:
═══════════════════════════════════════════════════════════════

${
  part ? `CZĘŚĆ ${part.number}/${part.total}` : "TEKST"
}: ${partLength} znaków (±10%)
ZAKRES: ${minLength}-${maxLength} znaków
PISZ ZWIĘŹLE!

${
  part
    ? `NAPISZ CZĘŚĆ ${part.number}/${part.total} W HTML (${minLength}-${maxLength} znaków):`
    : `NAPISZ TEKST W HTML (${minLength}-${maxLength} znaków):`
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens, // 🔒 UŻYJ OBLICZONEGO
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  let response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // 🔒 POST-PROCESSING
  const actualLength = response.length;
  console.log(
    `\n📏 WERYFIKACJA DŁUGOŚCI ${part ? `CZĘŚCI ${part.number}` : ""}:`
  );
  console.log(`   Oczekiwano: ${partLength} ±10% (${minLength}-${maxLength})`);
  console.log(`   Otrzymano: ${actualLength} znaków`);

  if (actualLength > maxLength) {
    console.warn(`⚠️ ZA DŁUGIE! Przycinam...`);
    const cutPoint = response.lastIndexOf("</p>", maxLength);
    if (cutPoint > minLength && cutPoint !== -1) {
      response = response.substring(0, cutPoint + 4);
      console.log(`   ✂️ Przycięto do ${response.length} znaków`);
    }
  } else if (actualLength < minLength) {
    console.warn(`⚠️ ZA KRÓTKIE! (${actualLength} < ${minLength})`);
  }

  const inRange = response.length >= minLength && response.length <= maxLength;
  console.log(`   ${inRange ? "✅ OK" : "⚠️ POZA ZAKRESEM"}\n`);

  // ZAPISZ
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

    const contentData = JSON.parse(text.content || "{}");
    const userSourcesArray = (contentData.scrapedContent || []).filter(
      (s: any) => s.status === "success" && s.isUserSource === true
    );
    const googleSourcesArray = (contentData.scrapedContent || []).filter(
      (s: any) => s.status === "success" && s.isUserSource !== true
    );

    const actualUserSourcesLength = userSourcesArray.reduce(
      (sum: number, s: any) => sum + (s.text?.length || 0),
      0
    );
    const actualGoogleSourcesLength = googleSourcesArray.reduce(
      (sum: number, s: any) => sum + (s.text?.length || 0),
      0
    );

    console.log("\n🔍 WERYFIKACJA ŹRÓDEŁ:");
    const hasUserSources = userSourcesArray.length > 0;
    const hasGoogleSources = googleSourcesArray.length > 0;

    console.log(
      `  ${hasUserSources ? "✅" : "❌"} Źródła użytkownika: ${
        hasUserSources
          ? `TAK (${
              userSourcesArray.length
            } źródeł, ${actualUserSourcesLength.toLocaleString()} znaków)`
          : "NIE"
      }`
    );
    console.log(
      `  ${hasGoogleSources ? "✅" : "ℹ️ "} Źródła z Google: ${
        hasGoogleSources
          ? `TAK (${
              googleSourcesArray.length
            } źródeł, ${actualGoogleSourcesLength.toLocaleString()} znaków)`
          : "NIE (pominięte)"
      }`
    );
    console.log(
      `  📊 Całkowita długość źródeł: ${sources.length.toLocaleString()} znaków\n`
    );

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

async function selectBestSourcesFromScraped(
  text: any,
  scrapedResults: Array<{
    url: string;
    text: string;
    length: number;
  }>
) {
  // Przygotuj preview (pierwsze 20k znaków każdego źródła)
  const sourcePreviews = scrapedResults
    .map((result, index) => {
      const preview = result.text.substring(0, 20000);
      return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ŹRÓDŁO ${index + 1}:
URL: ${result.url}
Całkowita długość: ${result.length} znaków
FRAGMENT (pierwsze 20,000 znaków):
${preview}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    })
    .join("\n\n");

  const prompt = `Jesteś ekspertem od oceny jakości źródeł internetowych.

ZADANIE: Przeczytaj fragmenty ${scrapedResults.length} zescrapowanych źródeł i wybierz 3-8 NAJLEPSZYCH do napisania tekstu.

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
JĘZYK: ${text.language}

KRYTERIA WYBORU:
1. Merytoryczność i rzetelność treści
2. Zgodność z tematem
3. Aktualność informacji
4. Poziom szczegółowości
5. Brak treści reklamowych/sprzedażowych
6. ⚠️ POMIŃ źródła z błędami lub bardzo krótkie (< 500 znaków)

ZASADY:
- Wybierz minimum 3, maksimum 8 źródeł
- Im więcej dobrych źródeł, tym lepiej
- Preferuj różnorodność perspektyw
- IGNORUJ źródła zawierające "403 Error", "SSL Error", itp.

ZESCRAPOWANE ŹRÓDŁA:
${sourcePreviews}

ODPOWIEDŹ:
Zwróć TYLKO numery wybranych źródeł oddzielone przecinkami (np: 1,3,5,7)
Bez żadnego dodatkowego tekstu!`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 150,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const response =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // ZAPISZ
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.text.update({
    where: { id: text.id },
    data: { selectPrompt: prompt, selectResponse: response },
  });
  await prisma.$disconnect();

  const selectedNumbers = response
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n) && n > 0 && n <= scrapedResults.length);

  if (selectedNumbers.length === 0) {
    console.warn("⚠️ Claude nie wybrał źródeł, wybieram 3 najdłuższe");
    // Fallback: 3 najdłuższe (> 1000 znaków)
    const validSources = scrapedResults
      .map((r, idx) => ({ idx: idx + 1, length: r.length }))
      .filter((r) => r.length > 1000)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3)
      .map((r) => r.idx);

    selectedNumbers.push(...validSources);
  }

  console.log(
    `✅ Claude wybrał ${selectedNumbers.length} źródeł: ${selectedNumbers.join(
      ", "
    )}`
  );
  return selectedNumbers.map((num) => scrapedResults[num - 1]);
}
