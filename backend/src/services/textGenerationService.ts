// backend/src/services/textGenerationService.ts
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { Text } from "@prisma/client";
import { generateExampleSection } from "./textExamples";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX || "47c4cfcb21523490f";

// ✅ HELPER: Generuj instrukcje SEO dla promptu
function generateSeoInstructions(text: any): string {
  console.log("🎯 generateSeoInstructions CALLED");
  console.log("   seoKeywords raw:", text.seoKeywords);
  console.log("   seoLinks raw:", text.seoLinks);

  let seoInstructions = "";

  // Parse JSON z bazy
  const seoKeywords = text.seoKeywords ? JSON.parse(text.seoKeywords) : [];
  const seoLinks = text.seoLinks ? JSON.parse(text.seoLinks) : [];

  if (seoKeywords.length === 0 && seoLinks.length === 0) {
    return ""; // Brak SEO
  }

  seoInstructions = `
═══════════════════════════════════════════════════════════════
🎯🎯🎯 KRYTYCZNE: OPTYMALIZACJA SEO 🎯🎯🎯
═══════════════════════════════════════════════════════════════`;

  // FRAZY KLUCZOWE
  if (seoKeywords.length > 0) {
    seoInstructions += `

📍 FRAZY KLUCZOWE DO UWZGLĘDNIENIA:
${seoKeywords.map((kw: string, i: number) => `   ${i + 1}. "${kw}"`).join("\n")}

⚠️⚠️⚠️ ZASADY UŻYCIA FRAZ KLUCZOWYCH:
1. Fraza główna ("${seoKeywords[0]}"):
   - MUSI wystąpić w <h1> lub na początku pierwszego <p>
   - Użyj ją 2-4 razy w całym tekście (naturalnie!)
   - Może wystąpić w <h2> lub <h3>

2. Pozostałe frazy:
   - Rozmieść równomiernie w tekście
   - Użyj w nagłówkach <h2>, <h3> lub <p>
   - NATURALNIE - bez wymuszania
   - Możesz użyć synonimów i odmian

3. ZAKAZ:
   ❌ Keyword stuffing (spam)
   ❌ Nienatural placement
   ❌ Powtarzanie tych samych fraz obok siebie

4. ✅ DOBRE PRAKTYKI:
   ✅ Użyj frazy w kontekście zdania
   ✅ Synonim zamiast powtórzenia
   ✅ Long-tail variations (np. "${seoKeywords[0]} w praktyce")
`;
  }

  // LINKOWANIE
  if (seoLinks.length > 0) {
    const characters = text.length;
    const maxLinks = characters <= 2000 ? 2 : characters <= 5000 ? 3 : 5;

    seoInstructions += `

🔗 LINKOWANIE ZEWNĘTRZNE - BARDZO WAŻNE!
${seoLinks
  .map(
    (link: any, i: number) =>
      `   ${i + 1}. <a href="${link.url}">${link.anchor}</a>`
  )
  .join("\n")}

⚠️⚠️⚠️ KRYTYCZNE ZASADY LINKOWANIA:
1. LIMIT: Użyj MAKSYMALNIE ${Math.min(
      seoLinks.length,
      maxLinks
    )} linków z podanych ${seoLinks.length}
   - Tekst ma ${characters} znaków → max ${maxLinks} linków

2. GDZIE UMIEŚCIĆ LINKI:
   ✅ W środku akapitu <p> (NIE na początku, NIE na końcu)
   ✅ W kontekście naturalnego zdania
   ✅ Rozmieszczone równomiernie (${Math.floor(
     characters / Math.min(seoLinks.length, maxLinks)
   )} znaków między linkami)
   ❌ NIGDY w <h1>, <h2>, <h3>
   ❌ NIGDY 2 linki w tym samym zdaniu
   ❌ NIGDY obok siebie

3. SKŁADNIA HTML:
   <a href="${seoLinks[0]?.url || "URL"}">${seoLinks[0]?.anchor || "anchor"}</a>
   
   PRZYKŁAD PRAWIDŁOWEGO UŻYCIA:
   <p>W dzisiejszych czasach <a href="${seoLinks[0]?.url}">${
      seoLinks[0]?.anchor
    }</a> staje się coraz ważniejsze dla firm pragnących rozwijać swoją obecność online.</p>

4. ANCHOR TEXT:
   - Użyj DOKŁADNIE podanego anchora: "${seoLinks[0]?.anchor}"
   - NIE zmieniaj, NIE skracaj, NIE dodawaj słów
   - Anchor musi pasować do kontekstu zdania

5. KOLEJNOŚĆ:
   - Użyj linków w podanej kolejności (najpierw link 1, potem 2, itd.)
   - Jeśli limit jest niższy niż liczba linków, użyj pierwszych ${maxLinks}

6. ROZMIESZCZENIE:
   ${
     characters <= 2000
       ? "- Link 1: około 25% tekstu\n   - Link 2: około 75% tekstu"
       : characters <= 5000
       ? "- Link 1: około 20% tekstu\n   - Link 2: około 50% tekstu\n   - Link 3: około 80% tekstu"
       : "- Linki równomiernie co ~" +
         Math.floor(characters / maxLinks) +
         " znaków"
   }

7. PRZYKŁAD ZŁEGO LINKOWANIA:
   ❌ Na początku: <p><a href="...">tekst</a> dalszy tekst...</p>
   ❌ Na końcu: <p>tekst... <a href="...">link</a></p>
   ❌ W nagłówku: <h2><a href="...">Tytuł z linkiem</a></h2>
   ❌ Obok siebie: <p>tekst <a href="...">link1</a> i <a href="...">link2</a></p>

8. PRZYKŁAD DOBREGO LINKOWANIA:
   ✅ <p>Przedsiębiorcy coraz częściej dostrzegają wartość <a href="${
     seoLinks[0]?.url
   }">${
      seoLinks[0]?.anchor
    }</a> w budowaniu trwałych relacji z klientami. To podejście przynosi wymierne korzyści w postaci...</p>

⚠️⚠️⚠️ PAMIĘTAJ: Claude MUSI użyć DOKŁADNIE ${Math.min(
      seoLinks.length,
      maxLinks
    )} linków z ${seoLinks.length} podanych!

    BARDZO BARDZO BARDZO WAŻNE!!!! ->>> anchor musi ZAPISANY PRAWIDŁOWO JĘZYKOWO - niedopuszczalne są NIEWŁAŚCIWE GRAMATYCZNE ODMIANY!!!!
`;
  }

  seoInstructions += `
═══════════════════════════════════════════════════════════════
`;

  return seoInstructions;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 TWARDY LIMIT TOKENÓW - ZAPOBIEGA PRZEKROCZENIU DŁUGOŚCI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function calculateMaxTokens(targetLength: number): number {
  // 🔴 KLUCZOWA ZMIANA: 1 token ≈ 4 znaki dla polskiego HTML
  const baseTokens = Math.ceil(targetLength / 4);

  const withMargin = Math.ceil(baseTokens * 1.85);

  const MIN_TOKENS = 1000;
  const MAX_TOKENS = 16000; // 🔴 ZMNIEJSZONE!

  const finalTokens = Math.max(MIN_TOKENS, Math.min(MAX_TOKENS, withMargin));

  console.log(`📊 KALKULACJA MAX_TOKENS:`);
  console.log(`   Target: ${targetLength} znaków`);
  console.log(`   Bazowe tokeny (÷4): ${baseTokens}`);
  console.log(`   Z marginesem (×2.2): ${withMargin}`);
  console.log(
    `   🔒 FINAL: ${finalTokens} tokenów (max ~${finalTokens * 4} znaków)\n`
  );

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

    // ✅ INTELIGENTNY TYTUŁ ZAMÓWIENIA
    let orderTitle: string;
    const textsCount = order.texts.length;

    if (textsCount === 1) {
      // 1 tekst - pełny tytuł (max 60 znaków)
      const topic = order.texts[0].topic;
      orderTitle = topic.length <= 60 ? topic : topic.substring(0, 57) + "...";
    } else if (textsCount === 2) {
      // 2 teksty - "Temat 1 + 1 więcej"
      const firstTopic = order.texts[0].topic;
      const shortFirst =
        firstTopic.length > 30
          ? firstTopic.substring(0, 27) + "..."
          : firstTopic;
      orderTitle = `${shortFirst} + 1 więcej`;
    } else {
      // 3+ teksty - "Temat 1 + X więcej"
      const firstTopic = order.texts[0].topic;
      const shortFirst =
        firstTopic.length > 30
          ? firstTopic.substring(0, 27) + "..."
          : firstTopic;
      const remaining = textsCount - 1;
      orderTitle = `${shortFirst} + ${remaining} więcej`;
    }

    // ✅ LEPSZY SUBJECT
    const emailSubject =
      textsCount === 1
        ? `Zamówienie "${orderTitle}" gotowe! 🎉`
        : `Zamówienie (${textsCount} teksty) gotowe! 🎉`;

    // ✅ HTML z informacją o liczbie tekstów
    const htmlContent = `
      <h2>Twoje zamówienie jest gotowe!</h2>
      <p>Zamówienie <strong>${orderTitle}</strong> zostało ukończone.</p>
      ${
        textsCount > 1
          ? `<p style="color: #7c3aed; font-weight: 600;">✨ Wygenerowano ${textsCount} tekstów</p>`
          : ""
      }
      <p style="color: #6b7280; font-size: 14px;">(${order.orderNumber})</p>
      <p>Możesz je pobrać logując się na swoje konto:</p>
      <a href="${
        process.env.FRONTEND_URL
      }/orders" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
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
              Data: emailSubject,
              Charset: "UTF-8",
            },
            Body: {
              Html: { Data: htmlContent, Charset: "UTF-8" },
              Text: {
                Data:
                  textsCount === 1
                    ? `Twoje zamówienie "${orderTitle}" (${order.orderNumber}) jest gotowe! Zaloguj się: ${process.env.FRONTEND_URL}/orders`
                    : `Twoje zamówienie (${textsCount} teksty) "${orderTitle}" (${order.orderNumber}) jest gotowe! Zaloguj się: ${process.env.FRONTEND_URL}/orders`,
                Charset: "UTF-8",
              },
            },
          },
        },
      })
    );

    console.log(`✉️ Email wysłany do ${email} (${textsCount} tekstów)`);
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
    model: "claude-sonnet-4-5-20250929", //model: "claude-3-haiku-20240307", oraz model: "claude-sonnet-4-5-20250929",
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

  // ✅ TIMEOUT: 5 min dla użytkownika, 100s dla Google
  const TIMEOUT = isUserSource ? 300000 : 100000; // 5 min vs 100s

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    try {
      console.log(
        `🕷️ Scrapuję ${isUserSource ? "[USER SOURCE]" : ""} [${i + 1}/${
          urls.length
        }]: ${url.substring(0, 60)}...`
      );
      console.log(`⏱️  Timeout: ${TIMEOUT / 1000}s`);

      const response = await axios.post(
        `${SCRAPER_URL}/scrape`,
        { url },
        {
          headers: { "Content-Type": "application/json" },
          timeout: TIMEOUT, // ✅ DYNAMICZNY TIMEOUT
        }
      );

      console.log(`📥 Status: ${response.status}`);
      console.log(
        `📥 Response data keys: ${Object.keys(response.data).join(", ")}`
      );
      console.log(
        `📥 Response.data.text length: ${response.data.text?.length || 0}`
      );

      if (response.data.text) {
        console.log(
          `📥 Pierwsze 500 znaków:\n${response.data.text.substring(0, 500)}`
        );
      }

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
        console.error(`  ❌ Invalid response - status: ${response.status}`);
        console.error(`  ❌ Response data: ${JSON.stringify(response.data)}`);
        throw new Error("Invalid scraper response");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`  ❌ Błąd scrapowania: ${error.message}`);
      if (error.response) {
        console.error(`  ❌ Response status: ${error.response.status}`);
        console.error(
          `  ❌ Response data: ${JSON.stringify(error.response.data)}`
        );
      }
      if (error.code === "ECONNABORTED") {
        console.error(
          `  ❌ Timeout - scraper nie odpowiedział w ${TIMEOUT / 1000}s`
        );
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
          console.warn("\n⚠️⚠️⚠️ BRAK ŹRÓDEŁ - TRYB AWARYJNY");
          console.warn("   Generowanie treści NA PODSTAWIE WIEDZY CLAUDE'A");
          console.warn("   Bez materiałów zewnętrznych\n");

          // Zapisz informację o braku źródeł
          const contentData = {
            googleQuery: googleQuery || "",
            noSourcesMode: true,
            reason: "Brak dostępnych źródeł do scrapowania",
            userSources: userSourcesData || null,
            scrapedContent: [],
          };

          await prisma.text.update({
            where: { id: text.id },
            data: { content: JSON.stringify(contentData, null, 2) },
          });
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
          noSourcesAvailable: allScrapedResults.length === 0,
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
      console.error("⚠️ Brak źródeł - generowanie bez materiałów źródłowych");
      return "BRAK DOSTĘPNYCH ŹRÓDEŁ - WYGENERUJ TREŚĆ NA PODSTAWIE WIEDZY OGÓLNEJ";
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
  const maxTokens = calculateMaxTokens(text.length);

  const targetLength = text.length;
  const structure = calculateContentStructure(targetLength);
  const seoInstructions = generateSeoInstructions(text);
  const requiredLists = Math.max(1, Math.floor(text.length / 5000));
  const requiredTables = Math.max(1, Math.floor(text.length / 8000));

  // 📏 POBIERZ WZÓR TEKSTU
  const exampleSection = generateExampleSection(targetLength);

  const prompt = `🔴🔴🔴 ABSOLUTNIE KRYTYCZNE - FORMAT ODPOWIEDZI 🔴🔴🔴

❌❌❌ ZAKAZ UŻYWANIA MARKDOWN! ❌❌❌
NIE PISZ: # ## ### * - 
NIE PISZ nagłówków z hashtagami!

✅✅✅ PISZ TYLKO CZYSTY HTML! ✅✅✅
PISZ: <h1> <h2> <h3> <p> <ul> <li> <table>

PRZYKŁAD PRAWIDŁOWY:
<h1>Tytuł</h1>
<p>Akapit tekstu...</p>
<h2>Sekcja</h2>

PRZYKŁAD BŁĘDNY (ZAKAZANY!):
# Tytuł
Akapit tekstu...
## Sekcja

TWOJA ODPOWIEDŹ MUSI ZACZYNAĆ SIĘ OD: <h1>
╔═══════════════════════════════════════════════════════════════╗
║  🔴🔴🔴 CEL: ${targetLength} ZNAKÓW - NIE MNIEJ! 🔴🔴🔴       ║
╚═══════════════════════════════════════════════════════════════╝

${exampleSection}

${seoInstructions}

📐 DODATKOWE WSKAZÓWKI STRUKTURY:
🎯 CEL: ~${structure.words} SŁÓW (${structure.paragraphs} akapitów)

📊 WYMAGANA STRUKTURA:
   • Sekcji <h2>: ${structure.sections}
   • Akapitów <p> łącznie: ${structure.paragraphs}
   • Słów na akapit: ~100 (4-5 zdań)

📏 PRZYKŁAD AKAPITU (~100 słów):
${structure.example}

⚠️ KAŻDY akapit = PODOBNA długość do przykładu!
⚠️ DOKŁADNIE ${structure.sections} sekcji <h2>!
⚠️ NIE WIĘCEJ, NIE MNIEJ!
═══════════════════════════════════════════════════════════════
📋 WYMAGANE ELEMENTY HTML:
═══════════════════════════════════════════════════════════════
✅ OBOWIĄZKOWE LISTY: ${requiredLists} (minimum!)
   - Użyj <ul> lub <ol> z co najmniej 4-6 elementami <li>
   - Każdy <li> powinien mieć 50-100 znaków
   - Lista dodaje ~400-600 znaków
✅ OBOWIĄZKOWE TABELE: ${requiredTables} (minimum!)
   - Użyj <table> z <thead>, <tbody>, <tr>, <th>, <td>
   - Co najmniej 4 kolumny × 5-8 wierszy
   - Tabela dodaje ~800-1500 znaków
═══════════════════════════════════════════════════════════════
KRYTYCZNE ZASADY FORMATOWANIA HTML:
═══════════════════════════════════════════════════════════════
1. Pisz TYLKO czysty HTML - bez <!DOCTYPE>, <html>, <head>, <body>
2. Rozpocznij od: <h1>Tytuł Tekstu</h1>
3. ${
    includeIntro
      ? "Następnie wstęp: <p>Wstęp... (400-600 znaków)</p>"
      : "Po tytule BEZPOŚREDNIO treść główna"
  }
4. Używaj <h2>, <h3>, <p>, <ul>, <ol>, <table>, <strong>, <em>
5. DODAJ ${requiredLists} list i ${requiredTables} tabel!
6. Zakończ sensownie na </p>
═══════════════════════════════════════════════════════════════
⚠️ JAK OSIĄGNĄĆ ${targetLength} ZNAKÓW:
═══════════════════════════════════════════════════════════════
${
  text.length <= 2000
    ? `
🔹 To KRÓTKI tekst (~${targetLength} znaków)
🔹 Struktura:
   - <h1> (50 znaków)
   - ${includeIntro ? "<p>Wstęp (400-500 znaków)</p>" : ""}
   - 3-4 sekcje <h2> z akapitami (każda ~500 znaków)
   - 1 lista <ul> z 5-6 elementami (500 znaków)
   - Zakończenie <p> (300 znaków)
🔹 RAZEM: ~${targetLength} znaków!
`
    : text.length <= 5000
    ? `
🔹 To ŚREDNI tekst (~${targetLength} znaków)
🔹 Struktura:
   - <h1> (50 znaków)
   - ${includeIntro ? "<p>Wstęp (500 znaków)</p>" : ""}
   - 4-5 sekcji <h2> (każda ~800-1000 znaków)
   - ${requiredLists} listy <ul> (po ~500 znaków)
   - ${requiredTables} tabele (po ~1000 znaków)
   - Zakończenie (400 znaków)
🔹 RAZEM: ~${targetLength} znaków!
`
    : `
🔹 To DŁUŻSZY tekst (~${targetLength} znaków)
🔹 Struktura:
   - <h1> + ${includeIntro ? "Wstęp + " : ""}5-6 sekcji <h2>
   - Każda sekcja z podsekcjami <h3>
   - ${requiredLists} rozbudowanych list
   - ${requiredTables} szczegółowych tabel
🔹 ROZWIJAJ SZCZEGÓŁOWO każdą myśl!
`
}
⚠️⚠️⚠️ SPRAWDZAJ DŁUGOŚĆ W TRAKCIE PISANIA:
- Po każdej sekcji <h2> sprawdź, ile jeszcze zostało do ${targetLength}
- Jeśli brakuje - dodaj więcej przykładów, rozwiń myśli, dodaj listy/tabele
- NIE KOŃCZ zanim nie osiągniesz ~${targetLength} znaków!
═══════════════════════════════════════════════════════════════
PARAMETRY:
═══════════════════════════════════════════════════════════════
- TEMAT: ${text.topic}
- RODZAJ: ${text.textType}
- 🎯 CEL: ~${structure.words} słów (~${targetLength} znaków)
- JĘZYK: ${text.language}
- WYTYCZNE: ${text.guidelines || "brak"}
- WYMAGANE LISTY: ${requiredLists}
- WYMAGANE TABELE: ${requiredTables}
═══════════════════════════════════════════════════════════════
ZASADY TREŚCI:
═══════════════════════════════════════════════════════════════
1. Pisz WYŁĄCZNIE w języku: ${text.language}
2. ZAKAZ kopiowania ze źródeł - własne słowa
3. ZAKAZ powtórzeń
4. Oryginalny, wartościowy, szczegółowy
5. 🎯 DĄŻYSZ DO ${targetLength} ZNAKÓW!
6. 📋 DODAJ ${requiredLists} list i ${requiredTables} tabel!
${
  hasUserSources
    ? `
⚠️ KRYTYCZNE: PRIORYTET DLA ŹRÓDEŁ UŻYTKOWNIKA
- Użytkownik wskazał konkretne materiały
- Wykorzystaj JE W PIERWSZEJ KOLEJNOŚCI
`
    : ""
}
═══════════════════════════════════════════════════════════════
${
  sources && sources.length > 50
    ? (hasUserSources
        ? "MATERIAŁY ŹRÓDŁOWE (UŻYTKOWNIK + GOOGLE):"
        : "ŹRÓDŁA:") +
      "\n" +
      sources
    : "⚠️ BRAK ŹRÓDEŁ ZEWNĘTRZNYCH - WYGENERUJ TREŚĆ NA PODSTAWIE WIEDZY OGÓLNEJ\nUżyj swojej wiedzy i kreatywności aby stworzyć wartościową, merytoryczną treść."
}
═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️ KRYTYCZNE - TWARDY LIMIT DŁUGOŚCI:
═══════════════════════════════════════════════════════════════
🔴 MAKSYMALNA DŁUGOŚĆ: ${Math.floor(targetLength * 1.15)} znaków
🔴 NIE PISZ WIĘCEJ! ZOSTANIESZ UCIĘTY!

JAK KONTROLOWAĆ DŁUGOŚĆ:
1. Po KAŻDEJ sekcji <h2> sprawdź ile już napisałeś
2. Gdy osiągniesz ~${Math.floor(targetLength * 0.85)} znaków → zacznij kończyć
3. Przy ~${targetLength} znaków → NATYCHMIAST zakończ pełnym zdaniem!

⚠️ PISZ ZWIĘŹLE! Nie rozpisuj się niepotrzebnie!
⚠️ Lepiej 95% celu niż urwany tekst!
⚠️ KAŻDE zdanie musi kończyć się kropką, wykrzyknikiem lub znakiem zapytania!
═══════════════════════════════════════════════════════════════
🎯 NAPISZ TEKST (${targetLength} ZNAKÓW, ${requiredLists} list, ${requiredTables} tabel):
═══════════════════════════════════════════════════════════════`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });
  // 🔍 DEBUG API RESPONSE
  console.log(`\n🔍🔍🔍 DEBUG API RESPONSE 🔍🔍🔍`);
  console.log(`   stop_reason: ${message.stop_reason}`);
  console.log(`   input_tokens: ${message.usage?.input_tokens}`);
  console.log(`   output_tokens: ${message.usage?.output_tokens}`);
  console.log(`   max_tokens wysłane: ${maxTokens}`);
  if (message.stop_reason === "max_tokens") {
    console.log(`   ⚠️ UWAGA: Tekst UCIĘTY przez limit tokenów!`);
  }

  let response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // 🔄 JEŚLI UCIĘTY - KONTYNUUJ OD MIEJSCA PRZERWANIA
  if (message.stop_reason === "max_tokens") {
    console.log(`   🔄 Uruchamiam kontynuację od miejsca przerwania...`);
    // 🆕 Dla krótkich tekstów nie ma struktury kierownika, przekazujemy undefined
    response = await continueFromTruncation(response, text, sources, undefined);
  }

  const actualLength = response.length;
  console.log(`\n📏 DŁUGOŚĆ WYGENEROWANEJ TREŚCI:`);
  console.log(`   Cel: ${targetLength} znaków`);
  console.log(`   Otrzymano: ${actualLength} znaków`);

  // ✅ TYLKO WERYFIKACJA
  const verification = await verifyAndFixEnding(
    response,
    text.length,
    true,
    text.topic
  );

  const finalResponse = verification.fixed;

  if (!verification.wasTruncated) {
    console.log(`   ✅ Prawidłowo zakończony - zachowano całość`);
  } else {
    console.log(`   ✂️ Poprawiono urwaną część`);
  }

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
  existingWriterResponses.push(finalResponse); // ✅ Zapisz POPRAWNY

  await prisma.text.update({
    where: { id: text.id },
    data: {
      writerPrompts: JSON.stringify(existingWriterPrompts),
      writerResponses: JSON.stringify(existingWriterResponses),
    },
  });
  await prisma.$disconnect();

  return finalResponse; // ✅ Zwróć POPRAWNY
}

// >= 10 000 znaków - Kierownik określa strukturę
async function generateStructure(
  text: any,
  writersCount: number = 1
): Promise<{
  fullStructure: string;
  writerAssignments: Array<{
    writer: number;
    sections: string;
    structure: string;
    targetLength: number;
  }>;
}> {
  const includeIntro = text.length >= 5000;

  let prompt: string;

  if (writersCount === 1) {
    // ✅ NOWY PROMPT Z OGRANICZENIEM STRUKTURY
    const maxSections = Math.max(2, Math.ceil(text.length / 3000));
    const maxSubsections = Math.max(3, Math.ceil(text.length / 1500));

    prompt = `Jesteś kierownikiem projektu content. Określ ZWIĘZŁĄ strukturę HTML.

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
DŁUGOŚĆ: ${text.length} znaków
JĘZYK: ${text.language}
WYTYCZNE: ${text.guidelines || "brak"}

╔═══════════════════════════════════════════════════════════════╗
║  ⚠️⚠️⚠️ KRYTYCZNE OGRANICZENIE STRUKTURY ⚠️⚠️⚠️              ║
╚═══════════════════════════════════════════════════════════════╝

Dla tekstu ${text.length} znaków:
   • MAKSYMALNIE ${maxSections} sekcji <h2> (nie więcej!)
   • MAKSYMALNIE ${maxSubsections} podsekcji <h3> łącznie
   • Każda sekcja <h2> = ~${Math.floor(text.length / maxSections)} znaków TREŚCI

❌ NIE PLANUJ WIĘCEJ SEKCJI! Pisarz potrzebuje miejsca na pełną treść!

FORMAT WYJŚCIOWY: Czysty HTML (bez <!DOCTYPE>, <html>, <body>)

STRUKTURA (TYLKO ${maxSections} sekcji <h2>!):
<h1>Tytuł</h1>
${includeIntro ? "<p>Wstęp (400-600 znaków)</p>" : ""}
<h2>Sekcja 1 (~${Math.floor((text.length - 1000) / maxSections)} znaków)</h2>
<p>Opis co zawiera sekcja...</p>
<h3>Podsekcja 1.1</h3>
<p>...</p>
[TYLKO ${maxSections - 1} więcej sekcji <h2>!]
<p>Zakończenie (300-400 znaków)</p>

⚠️ SUMA ZNAKÓW MUSI = ${text.length} (±10%)
⚠️ NIE WIĘCEJ NIŻ ${maxSections} SEKCJI <h2>!
⚠️ WYMAGANE ELEMENTY W STRUKTURZE:
   • Zaplanuj miejsca na ${Math.max(
     1,
     Math.floor(text.length / 5000)
   )} list <ul> (wstaw placeholder: <!-- LISTA -->)
   • Zaplanuj miejsce na ${Math.max(
     1,
     Math.floor(text.length / 8000)
   )} tabelę <table> (wstaw placeholder: <!-- TABELA -->)
   • Umieść je W ŚRODKU struktury, nie na końcu!
ODPOWIEDŹ - ZWIĘZŁA struktura HTML:`;
  } else {
    // ✅ WIELU PISARZY - PEŁNY PRZYKŁAD JSON DLA KAŻDEJ LICZBY
    const lengthPerWriter = Math.floor(text.length / writersCount);

    // ✅ GENERUJ PEŁNY PRZYKŁAD JSON (wszystkie obiekty)
    const exampleAssignments = [];
    for (let i = 1; i <= writersCount; i++) {
      if (i === 1) {
        // Pierwszy pisarz - H1 + ewentualnie wstęp + pierwsze sekcje
        exampleAssignments.push(`    {
      "writer": 1,
      "sections": "${
        includeIntro ? "H1 + Wstęp + Sekcje 1-2" : "H1 + Sekcje 1-2"
      }",
      "structure": "<h1>Tytuł Główny Tekstu</h1>${
        includeIntro
          ? "<p>Wstęp wprowadzający do tematu... (400 znaków)</p>"
          : ""
      }<h2>Sekcja 1: Wprowadzenie</h2><p>Opis wprowadzenia...</p><h3>Podsekcja 1.1</h3><p>...</p><h2>Sekcja 2: Podstawy</h2><p>...</p>",
      "targetLength": ${lengthPerWriter}
    }`);
      } else if (i === writersCount) {
        // Ostatni pisarz - ostatnie sekcje + zakończenie
        const sectionStart = (i - 1) * 2 + 1;
        const sectionEnd = i * 2;
        exampleAssignments.push(`    {
      "writer": ${i},
      "sections": "Sekcje ${sectionStart}-${sectionEnd} + Zakończenie",
      "structure": "<h2>Sekcja ${sectionStart}: Zaawansowane</h2><p>...</p><h2>Sekcja ${sectionEnd}: Podsumowanie</h2><p>...</p><p>Zakończenie: Podsumowanie całości... (300 znaków)</p>",
      "targetLength": ${lengthPerWriter}
    }`);
      } else {
        // Środkowi pisarze - środkowe sekcje
        const sectionStart = (i - 1) * 2 + 1;
        const sectionEnd = i * 2;
        exampleAssignments.push(`    {
      "writer": ${i},
      "sections": "Sekcje ${sectionStart}-${sectionEnd}",
      "structure": "<h2>Sekcja ${sectionStart}: Temat</h2><p>...</p><h3>Podsekcja ${sectionStart}.1</h3><p>...</p><h2>Sekcja ${sectionEnd}: Kolejny Temat</h2><p>...</p>",
      "targetLength": ${lengthPerWriter}
    }`);
      }
    }

    prompt = `Jesteś kierownikiem projektu content. KRYTYCZNE ZADANIE: Podziel strukturę HTML na ${writersCount} RÓWNE CZĘŚCI dla pisarzy.

TEMAT: ${text.topic}
RODZAJ: ${text.textType}
DŁUGOŚĆ: ${text.length} znaków
JĘZYK: ${text.language}
WYTYCZNE: ${text.guidelines || "brak"}
PISARZY: ${writersCount}

FORMAT ODPOWIEDZI - VALID JSON (bez komentarzy, bez \`\`\`):
{
  "fullStructure": "<h1>Tytuł</h1><h2>Sekcja 1</h2>...<h2>Sekcja N</h2><p>Zakończenie</p>",
  "writerAssignments": [
${exampleAssignments.join(",\n")}
  ]
}

KRYTYCZNE ZASADY:

1. MUSISZ UTWORZYĆ DOKŁADNIE ${writersCount} OBIEKTÓW w "writerAssignments"!

2. Każdy obiekt to jeden pisarz:
   - "writer": numer pisarza (1 do ${writersCount})
   - "sections": krótki opis co pisze (np. "Sekcje 3-4")
   - "structure": HTML TYLKO dla jego sekcji (np. "<h2>Sekcja 3</h2>...")
   - "targetLength": ${lengthPerWriter}

3. PODZIAŁ SEKCJI:
   - Pisarz 1: ${
     includeIntro ? "<h1> + <p>Wstęp</p> + " : "<h1> + "
   }pierwsze sekcje (np. 1-2)
   - Pisarze 2-${writersCount - 1}: środkowe sekcje (podzielone równo)
   - Pisarz ${writersCount}: ostatnie sekcje + <p>Zakończenie</p>

4. "fullStructure" = WSZYSTKIE sekcje od <h1> do zakończenia
   "structure" dla każdego pisarza = TYLKO jego sekcje

5. Każdy pisarz MUSI dostać RÓŻNE sekcje!
   Pisarz 1: Sekcje A-B
   Pisarz 2: Sekcje C-D (NIE A-B!)
   Pisarz 3: Sekcje E-F (NIE A-B, NIE C-D!)

PRZYKŁAD POPRAWNEJ ODPOWIEDZI dla ${writersCount} pisarzy:
{
  "fullStructure": "<h1>Pełny Tytuł</h1>${
    includeIntro ? "<p>Wstęp...</p>" : ""
  }<h2>Sekcja 1</h2>...<h2>Sekcja ${writersCount * 2}</h2><p>Zakończenie</p>",
  "writerAssignments": [
${exampleAssignments.join(",\n")}
  ]
}

ODPOWIEDŹ (TYLKO VALID JSON, BEZ \`\`\`json):`;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: writersCount === 1 ? 8000 : 12000,
    temperature: 0.5,
    messages: [{ role: "user", content: prompt }],
  });

  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📋 DEBUG STRUKTURY KIEROWNIKA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`\n📋📋📋 DEBUG STRUKTURY KIEROWNIKA 📋📋📋`);
  console.log(`   Temat: ${text.topic}`);
  console.log(`   Cel: ${text.length} znaków`);
  console.log(`   Liczba pisarzy: ${writersCount}`);
  console.log(`   Długość odpowiedzi kierownika: ${response.length} znaków`);

  // Wyciągnij nagłówki H1, H2, H3 ze struktury
  const h1Matches = response.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
  const h2Matches = response.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
  const h3Matches = response.match(/<h3[^>]*>([^<]*)<\/h3>/gi) || [];

  console.log(`\n   📌 TYTUŁ H1:`);
  h1Matches.forEach((h, i) => {
    const title = h.replace(/<[^>]*>/g, "").trim();
    console.log(`      "${title}"`);
  });

  console.log(`\n   📌 SEKCJE H2 (${h2Matches.length}):`);
  h2Matches.forEach((h, i) => {
    const title = h.replace(/<[^>]*>/g, "").trim();
    console.log(`      ${i + 1}. ${title}`);
  });

  console.log(`\n   📌 PODSEKCJE H3 (${h3Matches.length}):`);
  h3Matches.forEach((h, i) => {
    const title = h.replace(/<[^>]*>/g, "").trim();
    console.log(`      ${i + 1}. ${title}`);
  });

  console.log(`\n   📊 PODSUMOWANIE:`);
  console.log(`      • Tytuły H1: ${h1Matches.length}`);
  console.log(`      • Sekcje H2: ${h2Matches.length}`);
  console.log(`      • Podsekcje H3: ${h3Matches.length}`);
  console.log(
    `      • Razem nagłówków: ${
      h1Matches.length + h2Matches.length + h3Matches.length
    }`
  );

  // Sprawdź czy są wymagane elementy
  const hasLists = response.includes("<ul>") || response.includes("<ol>");
  const hasTables = response.includes("<table>");
  console.log(`\n   📋 ELEMENTY DODATKOWE:`);
  console.log(`      • Listy <ul>/<ol>: ${hasLists ? "✅ TAK" : "❌ NIE"}`);
  console.log(`      • Tabele <table>: ${hasTables ? "✅ TAK" : "❌ NIE"}`);

  console.log(`\n   📄 PIERWSZE 2000 ZNAKÓW STRUKTURY:`);
  console.log(`   ─────────────────────────────────────`);
  console.log(response.substring(0, 2000));
  console.log(`   ─────────────────────────────────────`);
  console.log(`📋📋📋 KONIEC DEBUG STRUKTURY 📋📋📋\n`);

  // ZAPISZ DO BAZY
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.text.update({
    where: { id: text.id },
    data: {
      structurePrompt: prompt,
      structureResponse: response,
    },
  });
  await prisma.$disconnect();

  // PARSE ODPOWIEDZI
  if (writersCount === 1) {
    return {
      fullStructure: response,
      writerAssignments: [
        {
          writer: 1,
          sections: "Cały tekst",
          structure: response,
          targetLength: text.length,
        },
      ],
    };
  } else {
    try {
      let cleanResponse = response
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const structureData = JSON.parse(cleanResponse);

      // ✅ WALIDACJA - czy dostaliśmy wszystkich pisarzy?
      if (structureData.writerAssignments.length !== writersCount) {
        throw new Error(
          `Kierownik zwrócił ${structureData.writerAssignments.length} pisarzy, oczekiwano ${writersCount}`
        );
      }

      console.log(
        `\n📋 KIEROWNIK PODZIELIŁ STRUKTURĘ NA ${writersCount} PISARZY:`
      );
      structureData.writerAssignments.forEach((assignment: any) => {
        console.log(
          `   Pisarz ${assignment.writer}: ${assignment.sections} (${assignment.targetLength} znaków)`
        );
      });
      console.log();

      return structureData;
    } catch (error) {
      console.error("❌ Błąd parsowania JSON od kierownika:", error);
      console.error("Response:", response.substring(0, 500));

      // FALLBACK
      console.warn("⚠️ Używam fallback - równy podział struktury");
      const sectionPerWriter = Math.floor(text.length / writersCount);
      return {
        fullStructure: response,
        writerAssignments: Array.from({ length: writersCount }, (_, i) => ({
          writer: i + 1,
          sections: `Część ${i + 1}/${writersCount}`,
          structure: response,
          targetLength: sectionPerWriter,
        })),
      };
    }
  }
}

async function verifyAndFixEnding(
  content: string,
  contentLength: number,
  isLastPart: boolean = false,
  textTopic: string = ""
): Promise<{ fixed: string; wasTruncated: boolean; reason: string }> {
  console.log(`\n🔍🔍🔍 WERYFIKACJA ZAKOŃCZENIA 🔍🔍🔍`);
  console.log(`   📏 Długość wejściowa: ${content.length} znaków`);
  console.log(`   🎯 Cel: ${contentLength} znaków`); // ✅ UŻYTE
  console.log(`   📍 Ostatnia część: ${isLastPart ? "TAK" : "NIE"}`); // ✅ UŻYTE
  if (textTopic) {
    console.log(`   📝 Temat: ${textTopic.substring(0, 50)}...`); // ✅ UŻYTE
  }

  const trimmed = content.trimEnd();
  let fixed = trimmed;

  // 1. Usuń urwany tag HTML jeśli jest
  const lastOpenBracket = content.lastIndexOf("<");
  const lastCloseBracket = content.lastIndexOf(">");
  if (lastOpenBracket > lastCloseBracket) {
    console.log(`   🔧 Usuwam urwany tag HTML...`);
    fixed = content.substring(0, lastOpenBracket).trimEnd();
  }

  // 2. 🆕 WALIDACJA PRZEZ CLAUDE - rozumie czy zdanie jest kompletne
  const lastChunk = fixed.substring(Math.max(0, fixed.length - 800));

  console.log(`   🤖 Walidacja zakończenia przez Claude...`);

  try {
    const validationPrompt = `Sprawdź czy ten fragment tekstu HTML kończy się POPRAWNYM, KOMPLETNYM zdaniem polskim.

TEMAT TEKSTU: ${textTopic || "nieznany"}
CZY TO OSTATNIA CZĘŚĆ: ${isLastPart ? "TAK - powinno być zakończenie" : "NIE"}

FRAGMENT (ostatnie ~800 znaków):
${lastChunk}

SPRAWDŹ:
1. Czy ostatnie zdanie jest gramatycznie poprawne?
2. Czy nie jest urwane w połowie słowa? (np. "zaoszczę" zamiast "zaoszczędzony")
3. Czy kończy się sensownie?
${isLastPart ? "4. Czy ma naturalne zakończenie artykułu?" : ""}

ODPOWIEDZ TYLKO W JSON (bez markdown):
{
  "isComplete": true/false,
  "lastSentence": "ostatnie zdanie",
  "problem": "opis problemu lub null",
  "charsToRemove": 0
}

Jeśli isComplete=false, podaj w "charsToRemove" ile znaków od końca usunąć żeby mieć pełne zdanie.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      temperature: 0,
      messages: [{ role: "user", content: validationPrompt }],
    });

    const response =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : "{}";
    const cleanResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const result = JSON.parse(cleanResponse);

    console.log(`   📊 Claude mówi: isComplete=${result.isComplete}`);
    if (result.problem) {
      console.log(`   ⚠️ Problem: ${result.problem}`);
    }

    if (!result.isComplete && result.charsToRemove > 0) {
      console.log(`   ✂️ Przycinam ${result.charsToRemove} znaków...`);
      fixed = fixed.substring(0, fixed.length - result.charsToRemove).trimEnd();

      // Znajdź ostatnią kropkę/wykrzyknik/pytajnik
      const lastPunctuation = Math.max(
        fixed.lastIndexOf(". "),
        fixed.lastIndexOf("! "),
        fixed.lastIndexOf("? "),
        fixed.lastIndexOf(".</p>"),
        fixed.lastIndexOf("!</p>"),
        fixed.lastIndexOf("?</p>")
      );

      if (lastPunctuation > fixed.length * 0.85) {
        // Mamy dobry punkt - przytnij tam
        if (fixed[lastPunctuation + 1] === "<") {
          // Kończy się np. ".</p>" - zostaw
          fixed = fixed.substring(0, lastPunctuation + 5);
        } else {
          // Kończy się np. ". " - dodaj </p>
          fixed = fixed.substring(0, lastPunctuation + 1) + "</p>";
        }
      }
    }
  } catch (error) {
    console.error(`   ❌ Błąd walidacji Claude:`, error);
    // Fallback: przytnij do ostatniej kropki
    const lastDot = fixed.lastIndexOf(". ");
    if (lastDot > fixed.length * 0.85) {
      fixed = fixed.substring(0, lastDot + 1) + "</p>";
      console.log(`   🔧 Fallback: przycięto do ostatniej kropki`);
    }
  }

  // 3. Upewnij się że kończy się tagiem </p>
  const closingTags = ["</p>", "</ul>", "</ol>", "</table>", "</li>"];
  if (!closingTags.some((tag) => fixed.endsWith(tag))) {
    if (!fixed.endsWith(".") && !fixed.endsWith("!") && !fixed.endsWith("?")) {
      fixed += ".";
    }
    fixed += "</p>";
    console.log(`   🔧 Dodano </p> na końcu`);
  }

  // 4. ✅ UŻYJ contentLength do logowania
  const percentOfTarget = Math.round((fixed.length / contentLength) * 100);
  console.log(
    `   📊 Długość po: ${fixed.length} znaków (${percentOfTarget}% celu)`
  );
  console.log(`🔍🔍🔍 KONIEC WERYFIKACJI 🔍🔍🔍\n`);

  return {
    fixed,
    wasTruncated: fixed.length !== content.length,
    reason: "validated_by_claude",
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆕 DODAJ TĘ FUNKCJĘ - WALIDACJA LINKÓW SEO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateSeoLinks(
  content: string,
  requiredLinks: Array<{ url: string; anchor: string }>
): {
  valid: boolean;
  foundCount: number;
  missingLinks: Array<{ url: string; anchor: string }>;
} {
  console.log(`\n🔗 WALIDACJA LINKÓW SEO...`);
  console.log(`   Wymagane linki: ${requiredLinks.length}`);

  const missingLinks: Array<{ url: string; anchor: string }> = [];
  let foundCount = 0;

  for (const link of requiredLinks) {
    // Szukaj href z tym URL
    const urlEscaped = link.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hrefRegex = new RegExp(
      `<a[^>]*href=["']${urlEscaped}["'][^>]*>`,
      "i"
    );

    if (hrefRegex.test(content)) {
      foundCount++;
      console.log(
        `   ✅ Znaleziono: "${link.anchor}" → ${link.url.substring(0, 50)}...`
      );
    } else {
      console.log(
        `   ❌ BRAK: "${link.anchor}" → ${link.url.substring(0, 50)}...`
      );
      missingLinks.push(link);
    }
  }

  console.log(`   📊 Znaleziono: ${foundCount}/${requiredLinks.length} linków`);

  return {
    valid: foundCount >= requiredLinks.length,
    foundCount,
    missingLinks,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆕 DODAJ TĘ FUNKCJĘ - WSTAWIANIE BRAKUJĄCYCH LINKÓW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function addMissingSeoLinks(
  content: string,
  missingLinks: Array<{ url: string; anchor: string }>
): Promise<string> {
  if (missingLinks.length === 0) return content;

  console.log(`\n🔗 WSTAWIANIE ${missingLinks.length} BRAKUJĄCYCH LINKÓW...`);

  const prompt = `Musisz NATURALNIE wstawić brakujące linki SEO do tekstu HTML.

BRAKUJĄCE LINKI:
${missingLinks
  .map((l, i) => `${i + 1}. <a href="${l.url}">${l.anchor}</a>`)
  .join("\n")}

ZASADY WSTAWIANIA:
1. Wstaw W ŚRODKU akapitu <p> - NIE na początku, NIE na końcu
2. Anchor musi pasować GRAMATYCZNIE do kontekstu
3. NIE wstawiaj w nagłówki <h1>, <h2>, <h3>
4. NIE zmieniaj anchora - użyj dokładnie takiego jak podany
5. Zachowaj resztę tekstu BEZ ZMIAN

TEKST HTML:
${content}

Zwróć TYLKO zmodyfikowany HTML (bez komentarzy, bez markdown):`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: Math.ceil(content.length / 3) + 2000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const response =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Sprawdź czy linki zostały dodane
    let addedCount = 0;
    for (const link of missingLinks) {
      if (response.includes(link.url)) {
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(
        `   ✅ Wstawiono ${addedCount}/${missingLinks.length} linków`
      );
      return response;
    } else {
      console.log(`   ⚠️ Nie udało się wstawić linków`);
      return content;
    }
  } catch (error) {
    console.error(`   ❌ Błąd wstawiania linków:`, error);
    return content;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 KONTYNUACJA OD MIEJSCA PRZERWANIA - ZAMIAST SZTUCZNEGO PODSUMOWANIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function continueFromTruncation(
  truncatedContent: string,
  text: any,
  sources: string,
  plannedStructure?: string // 🆕 NOWY PARAMETR - struktura od kierownika
): Promise<string> {
  console.log(`\n🔄🔄🔄 KONTYNUACJA OD MIEJSCA PRZERWANIA 🔄🔄🔄`);

  // Znajdź ostatnie pełne zdanie
  const lastDot = truncatedContent.lastIndexOf(". ");
  const lastExclaim = truncatedContent.lastIndexOf("! ");
  const lastQuestion = truncatedContent.lastIndexOf("? ");
  const lastSentenceEnd = Math.max(lastDot, lastExclaim, lastQuestion);

  // Przytnij do ostatniego pełnego zdania
  let cleanContent = truncatedContent;
  if (lastSentenceEnd > truncatedContent.length * 0.8) {
    cleanContent = truncatedContent.substring(0, lastSentenceEnd + 1);
  }

  // Weź ostatnie 3000 znaków jako kontekst
  const contextLength = 3000;
  const lastContext = cleanContent.substring(
    Math.max(0, cleanContent.length - contextLength)
  );

  console.log(
    `   📏 Długość urwanego tekstu: ${truncatedContent.length} znaków`
  );
  console.log(`   📏 Długość po przycięciu: ${cleanContent.length} znaków`);
  console.log(
    `   📄 Kontekst do kontynuacji: ostatnie ${lastContext.length} znaków`
  );

  // 🆕 ANALIZA STRUKTURY - co zostało napisane, a co brakuje
  let structureAnalysis = "";
  let missingSections: string[] = [];

  if (plannedStructure) {
    // Wyciągnij zaplanowane sekcje H2 ze struktury kierownika
    const plannedH2Regex = /<h2[^>]*>([^<]*)<\/h2>/gi;
    const plannedH2Matches = plannedStructure.match(plannedH2Regex) || [];
    const plannedH2List = plannedH2Matches.map((h: string) =>
      h.replace(/<[^>]*>/g, "").trim()
    );

    // Wyciągnij napisane sekcje H2 z urwanego tekstu
    const writtenH2Matches = cleanContent.match(plannedH2Regex) || [];
    const writtenH2List = writtenH2Matches.map((h: string) =>
      h.replace(/<[^>]*>/g, "").trim()
    );

    // Znajdź brakujące sekcje
    missingSections = plannedH2List.filter(
      (planned: string) =>
        !writtenH2List.some(
          (written: string) =>
            written
              .toLowerCase()
              .includes(planned.toLowerCase().substring(0, 20)) ||
            planned
              .toLowerCase()
              .includes(written.toLowerCase().substring(0, 20))
        )
    );

    console.log(`\n   📋 ANALIZA STRUKTURY:`);
    console.log(`      Zaplanowane sekcje H2: ${plannedH2List.length}`);
    plannedH2List.forEach((h: string, i: number) =>
      console.log(`         ${i + 1}. ${h}`)
    );
    console.log(`      Napisane sekcje H2: ${writtenH2List.length}`);
    writtenH2List.forEach((h: string, i: number) =>
      console.log(`         ${i + 1}. ${h}`)
    );
    console.log(`      Brakujące sekcje: ${missingSections.length}`);
    missingSections.forEach((h: string, i: number) =>
      console.log(`         ${i + 1}. ${h}`)
    );

    if (missingSections.length > 0) {
      structureAnalysis = `
═══════════════════════════════════════════════════════════════
📋 ZAPLANOWANA STRUKTURA OD KIEROWNIKA:
═══════════════════════════════════════════════════════════════
${plannedStructure}

⚠️⚠️⚠️ BRAKUJĄCE SEKCJE (MUSISZ JE NAPISAĆ!):
${missingSections.map((s, i) => `   ${i + 1}. ${s}`).join("\n")}

✅ JUŻ NAPISANE SEKCJE:
${writtenH2List.map((s: string, i: number) => `   ${i + 1}. ${s}`).join("\n")}

🎯 TWOJE ZADANIE:
- Dokończ bieżącą sekcję (jeśli urwana)
- Napisz WSZYSTKIE brakujące sekcje: ${missingSections.join(", ")}
- Dodaj naturalne ZAKOŃCZENIE artykułu
═══════════════════════════════════════════════════════════════
`;
    } else {
      structureAnalysis = `
═══════════════════════════════════════════════════════════════
📋 WSZYSTKIE SEKCJE ZOSTAŁY NAPISANE!
═══════════════════════════════════════════════════════════════
Tekst zawiera wszystkie zaplanowane sekcje.
Twoim zadaniem jest tylko:
1. Dokończyć ostatnią urwaną sekcję (jeśli jest urwana)
2. Dodać naturalne ZAKOŃCZENIE artykułu (2-3 akapity)
═══════════════════════════════════════════════════════════════
`;
    }
  }

  // Oblicz ile jeszcze potrzeba
  const remainingNeeded = Math.max(
    500,
    missingSections.length > 0
      ? missingSections.length * 2000 // 🆕 ~2000 znaków na sekcję H2
      : Math.min(2000, text.length - cleanContent.length + 500)
  );

  const maxTokens = Math.ceil(remainingNeeded / 3) + 800; // 🆕 Większy margines

  console.log(`   🎯 Potrzeba jeszcze: ~${remainingNeeded} znaków`);
  console.log(`   🔢 Max tokens dla kontynuacji: ${maxTokens}`);

  const continuationPrompt = `🔴🔴🔴 KRYTYCZNE ZADANIE: KONTYNUUJ I DOKOŃCZ TEKST 🔴🔴🔴

Poniżej znajduje się KONIEC URWANEGO TEKSTU. Twoje zadanie to:
1. KONTYNUUJ DOKŁADNIE od miejsca gdzie tekst się urywa
2. ${
    missingSections.length > 0
      ? `NAPISZ BRAKUJĄCE SEKCJE: ${missingSections.join(", ")}`
      : "Dokończ bieżącą sekcję"
  }
3. ZAKOŃCZ PŁYNNIE i NATURALNIE artykuł

${structureAnalysis}

═══════════════════════════════════════════════════════════════
📄 OSTATNIA CZĘŚĆ URWANEGO TEKSTU (kontekst):
═══════════════════════════════════════════════════════════════
${lastContext}
═══════════════════════════════════════════════════════════════

⚠️⚠️⚠️ ZASADY KONTYNUACJI:
1. NIE POWTARZAJ tego co już napisane!
2. KONTYNUUJ od ostatniego zdania - płynnie!
3. ${
    missingSections.length > 0
      ? `NAPISZ brakujące sekcje używając <h2>, <h3>, <p>`
      : "Napisz naturalne ZAKOŃCZENIE artykułu"
  }
4. Użyj HTML: <p>, <h2>, <h3>, <strong> (ale NIE dodawaj nowego <h1>!)
5. Zakończ na </p>
6. Napisz ~${remainingNeeded} znaków

TEMAT: ${text.topic}
JĘZYK: ${text.language}

🎯 KONTYNUUJ TEKST (${remainingNeeded} znaków, zakończ na </p>):`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [{ role: "user", content: continuationPrompt }],
  });

  const continuation =
    message.content[0].type === "text" ? message.content[0].text : "";

  console.log(`   ✅ Wygenerowano kontynuację: ${continuation.length} znaków`);
  console.log(`   📄 Pierwsze 300 znaków kontynuacji:`);
  console.log(`   "${continuation.substring(0, 300)}..."`);

  // Połącz: przycięty tekst + kontynuacja
  let finalContent = cleanContent;

  if (!cleanContent.trimEnd().endsWith("</p>")) {
    finalContent += "</p>\n\n";
  } else {
    finalContent += "\n\n";
  }

  finalContent += continuation.trim();

  // Upewnij się że kończy się </p>
  if (!finalContent.trimEnd().endsWith("</p>")) {
    if (
      !finalContent.trimEnd().endsWith(".") &&
      !finalContent.trimEnd().endsWith("!") &&
      !finalContent.trimEnd().endsWith("?")
    ) {
      finalContent += ".";
    }
    finalContent += "</p>";
  }

  console.log(`   📏 Finalna długość: ${finalContent.length} znaków`);
  console.log(`🔄🔄🔄 KONIEC KONTYNUACJI 🔄🔄🔄\n`);

  return finalContent;
}

// Pisarz - generuje treść na podstawie struktury
async function generateWithStructure(
  text: any,
  writerAssignment: {
    writer: number;
    sections: string;
    structure: string;
    targetLength: number;
  },
  sources: string,
  part?: {
    number: number;
    total: number;
    previousContent?: string;
    completedSections?: string[];
  }
): Promise<string> {
  const includeIntro = text.length >= 5000;
  const hasUserSources = sources.includes("ŹRÓDŁA PRIORYTETOWE");

  const partLength = writerAssignment.targetLength;
  const maxTokens = calculateMaxTokens(partLength);
  const targetLength = partLength;
  const structure = calculateContentStructure(targetLength);

  const requiredLists = Math.max(1, Math.floor(partLength / 5000));
  const requiredTables = Math.max(1, Math.floor(partLength / 8000));

  // ✅ WYCIĄGNIJ LISTĘ H2 ZE STRUKTURY KIEROWNIKA
  const h2Regex = /<h2[^>]*>([^<]*)<\/h2>/gi;
  const h2Matches = writerAssignment.structure.match(h2Regex) || [];
  const h2List = h2Matches.map((h: string) => h.replace(/<[^>]*>/g, "").trim());
  const h2Count = h2List.length;

  // ✅ FORMATUJ LISTĘ H2 PRZED UŻYCIEM W TEMPLATE STRING
  const h2ListFormatted = h2List
    .map((h: string, i: number) => `   ${i + 1}. "${h}"`)
    .join("\n");

  const structureEnforcementSection = `
═══════════════════════════════════════════════════════════════
🔴🔴🔴 KRYTYCZNE - TRZYMAJ SIĘ STRUKTURY KIEROWNIKA! 🔴🔴🔴
═══════════════════════════════════════════════════════════════

STRUKTURA MA DOKŁADNIE ${h2Count} SEKCJI H2.
MUSISZ NAPISAĆ DOKŁADNIE ${h2Count} SEKCJI H2 - NIE WIĘCEJ, NIE MNIEJ!

DOZWOLONE SEKCJE H2:
${h2ListFormatted}

❌ ZAKAZ: Dodawania NOWYCH sekcji H2 których nie ma na liście!
❌ ZAKAZ: Zmieniania tytułów sekcji!
❌ ZAKAZ: Pomijania sekcji!
✅ DOZWOLONE: Rozbudowanie treści W RAMACH istniejących sekcji
✅ DOZWOLONE: Dodanie więcej akapitów <p> w sekcjach

⚠️ JEŚLI CHCESZ DODAĆ WIĘCEJ TREŚCI - ROZWIŃ ISTNIEJĄCE SEKCJE!
`;

  const contextInfo = part
    ? `
═══════════════════════════════════════════════════════════════
🔴 PISZESZ CZĘŚĆ ${part.number} z ${part.total} 🔴
═══════════════════════════════════════════════════════════════

${
  part.completedSections && part.completedSections.length > 0
    ? `✅ JUŻ NAPISANE (przez poprzednich pisarzy):
${part.completedSections.map((s) => `   - ${s}`).join("\n")}

⚠️⚠️⚠️ NIE POWTARZAJ tych sekcji!
⚠️⚠️⚠️ NIE PISZ ponownie tych tematów!
`
    : "To pierwsza część - zacznij od początku."
}

${
  part.previousContent
    ? `📄 OSTATNIE 5000 ZNAKÓW POPRZEDNIEJ CZĘŚCI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${part.previousContent.substring(
  Math.max(0, part.previousContent.length - 5000)
)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ KONTYNUUJ PŁYNNIE od tego miejsca!
`
    : ""
}
`
    : "";

  const seoInstructions =
    part?.number === 1 ? generateSeoInstructions(text) : "";

  // 📏 POBIERZ WZÓR TEKSTU
  const exampleSection = generateExampleSection(targetLength);

  const prompt = `🔴🔴🔴 ABSOLUTNIE KRYTYCZNE - FORMAT ODPOWIEDZI 🔴🔴🔴

❌❌❌ ZAKAZ UŻYWANIA MARKDOWN! ❌❌❌
NIE PISZ: # ## ### * - 
NIE PISZ nagłówków z hashtagami!

✅✅✅ PISZ TYLKO CZYSTY HTML! ✅✅✅
PISZ: <h1> <h2> <h3> <p> <ul> <li> <table>

PRZYKŁAD PRAWIDŁOWY:
<h1>Tytuł</h1>
<p>Akapit tekstu...</p>
<h2>Sekcja</h2>

PRZYKŁAD BŁĘDNY (ZAKAZANY!):
# Tytuł
Akapit tekstu...
## Sekcja

TWOJA ODPOWIEDŹ MUSI ZACZYNAĆ SIĘ OD: <h1>
╔═══════════════════════════════════════════════════════════════╗
║  🎯 CEL: ${writerAssignment.sections} - ${targetLength} ZNAKÓW! 🎯  ║
╚═══════════════════════════════════════════════════════════════╝

${exampleSection}

${contextInfo}
${seoInstructions}

📐 DODATKOWE WSKAZÓWKI STRUKTURY:
🎯 CEL: ~${structure.words} SŁÓW (${structure.paragraphs} akapitów)

📊 WYMAGANE:
   • Akapitów łącznie: ${structure.paragraphs}
   • Słów/akapit: ~100
   • ⚠️ LICZBĘ SEKCJI H2 OKREŚLA STRUKTURA KIEROWNIKA PONIŻEJ!

📏 PRZYKŁAD AKAPITU:
${structure.example}

⚠️ TRZYMAJ SIĘ TEJ STRUKTURY!

═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️ KRYTYCZNE - CO MASZ NAPISAĆ ⚠️⚠️⚠️
═══════════════════════════════════════════════════════════════

NIE PISZ SAMEJ STRUKTURY!
NIE PISZ SZKICU!
NIE PISZ PLANU!

NAPISZ PEŁNĄ, KOMPLETNĄ TREŚĆ TEKSTU!

Poniżej widzisz STRUKTURĘ - to tylko PLAN tego co masz napisać.
Twoim zadaniem jest WYPEŁNIĆ tę strukturę PEŁNĄ TREŚCIĄ.

Każde <h2> i <h3> musi mieć ROZBUDOWANE akapity <p> z merytoryczną treścią.
Każdy akapit powinien mieć 300-500 znaków.
NIE powtarzaj struktury - NAPISZ PRAWDZIWY TEKST!

═══════════════════════════════════════════════════════════════
═══════════════════════════════════════════════════════════════
📋 WYMAGANE ELEMENTY DLA TEJ CZĘŚCI - KRYTYCZNE!
═══════════════════════════════════════════════════════════════

🔴🔴🔴 MUSISZ DODAĆ DOKŁADNIE:

✅ LISTY: ${requiredLists} (OBOWIĄZKOWE!)
   - Użyj <ul> lub <ol> z 5-7 elementami <li>
   - Każdy <li>: 50-100 znaków treści
   - ⚠️ UMIEŚĆ W ŚRODKU TEKSTU (po 2-3 sekcji)
   - NIE POMIJAJ - LISTA JEST WYMAGANA!

✅ TABELE: ${requiredTables} (OBOWIĄZKOWE!)
   - 4+ kolumny × 6-8 wierszy
   - <table><thead><tbody><tr><th><td>
   - ⚠️ UMIEŚĆ W ŚRODKU TEKSTU
   - Po tabeli MUSI być jeszcze akapit <p>!

⚠️ SPRAWDŹ PRZED ZAKOŃCZENIEM:
   □ Czy mam ${requiredLists} list <ul>/<ol>?
   □ Czy mam ${requiredTables} tabel <table>?
   □ Czy są w ŚRODKU tekstu, nie na końcu?

═══════════════════════════════════════════════════════════════
KRYTYCZNE ZASADY FORMATOWANIA HTML:
═══════════════════════════════════════════════════════════════

1. Pisz TYLKO czysty HTML - bez <!DOCTYPE>, <html>, <head>, <body>
2. ${
    !part || part?.number === 1
      ? "Rozpocznij od: <h1>Pełny tytuł tekstu zgodny z tematem</h1>"
      : "Kontynuuj od poprzedniej części - NIE dodawaj <h1>"
  }
3. ${
    includeIntro && part?.number === 1
      ? "Po tytule PEŁNY wstęp: <p>TREŚĆ wstępu minimum 400-600 znaków PRAWDZIWEJ TREŚCI</p>"
      : part?.number === 1
      ? "Po tytule BEZPOŚREDNIO PEŁNA treść"
      : ""
  }
4. Każde <h2>, <h3> to NAGŁÓWKI sekcji - po nich MUSZĄ być akapity <p> z PEŁNĄ TREŚCIĄ
5. NIE PISZ "Treść sekcji 1..." - NAPISZ PRAWDZIWĄ TREŚĆ!

═══════════════════════════════════════════════════════════════
ZASADY TREŚCI:
═══════════════════════════════════════════════════════════════

1. Język: ${text.language}
2. ZAKAZ kopiowania ze źródeł
3. PISZ MERYTORYCZNĄ, WARTOŚCIOWĄ TREŚĆ - nie szkic!
4. Każdy akapit to MINIMUM 3-4 zdania pełnej treści
5. 🎯 DĄŻYSZ DO ${targetLength} ZNAKÓW PRAWDZIWEJ TREŚCI!
${
  part && part.completedSections
    ? `6. 🔴 ZAKAZ POWTÓRZEŃ - już napisane: ${part.completedSections.join(
        ", "
      )}`
    : ""
}
7. 📋 DODAJ ${requiredTables} tabel${
    requiredLists > 0 ? ` i ${requiredLists} list` : ""
  }!

${
  hasUserSources
    ? `
⚠️ PRIORYTET: ŹRÓDŁA UŻYTKOWNIKA
- Użyj ich W PIERWSZEJ KOLEJNOŚCI
`
    : ""
}

⚠️⚠️⚠️ PRZYKŁAD ZŁEGO WYKONANIA (NIE RÓB TAK!):
<h2>Sekcja 1: Wprowadzenie</h2>
<p>Treść wprowadzenia...</p>
<h3>Podsekcja 1.1</h3>
<p>Opis podsekcji...</p>

✅✅✅ PRZYKŁAD DOBREGO WYKONANIA (TAK RÓB!):
<h2>Struktura pracy magisterskiej</h2>
<p>Praca magisterska to złożony dokument naukowy, który wymaga przestrzegania określonych standardów formalnych i metodologicznych. Każdy element pracy, od strony tytułowej po bibliografię, pełni istotną funkcję w prezentacji przeprowadzonych badań i wniosków. Właściwe zrozumienie struktury pracy pozwala na efektywne planowanie procesu pisania oraz uniknięcie typowych błędów.</p>
<h3>Elementy wstępne</h3>
<p>Do elementów wstępnych pracy magisterskiej zaliczamy stronę tytułową, spis treści oraz streszczenie. Strona tytułowa musi zawierać pełną nazwę uczelni, wydział, kierunek studiów, tytuł pracy, imię i nazwisko autora oraz promotora, a także rok złożenia pracy. Spis treści powinien być generowany automatycznie z wykorzystaniem stylów formatowania, co zapewnia zgodność numeracji stron.</p>

═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️ KRYTYCZNE - ZARZĄDZANIE DŁUGOŚCIĄ:
═══════════════════════════════════════════════════════════════

1. Monitoruj swoją długość podczas pisania
2. Jeśli zbliżasz się do ${targetLength} znaków:
   ✅ ZAKOŃCZ na sensownym miejscu (koniec akapitu lub sekcji)
   ✅ Dodaj krótkie podsumowanie jeśli to ostatnia część
   ✅ NIE ZOSTAWIAJ urwanego zdania!
3. LEPIEJ SKOŃCZYĆ przy ${Math.floor(targetLength * 0.95)} niż pisać za dużo!
4. ${
    part?.number === part?.total
      ? "To OSTATNIA CZĘŚĆ - MUSISZ dodać ZAKOŃCZENIE!"
      : ""
  }

${structureEnforcementSection}

═══════════════════════════════════════════════════════════════
🎯 STRUKTURA DO WYPEŁNIENIA TREŚCIĄ:
═══════════════════════════════════════════════════════════════

${writerAssignment.structure}

⚠️ TO POWYŻEJ TO TYLKO PLAN! 
⚠️ NAPISZ PEŁNĄ TREŚĆ ZGODNĄ Z TYM PLANEM!
⚠️ NIE POWTARZAJ STRUKTURY - WYPEŁNIJ JĄ TREŚCIĄ!

${
  part && part.number > 1
    ? `
⚠️⚠️⚠️ KRYTYCZNE - KONTYNUACJA ⚠️⚠️⚠️
Poprzedni pisarze już napisali: ${
        part.completedSections ? part.completedSections.join(", ") : "początek"
      }
TY piszesz TYLKO: ${writerAssignment.sections}
NIE ZACZYNAJ od początku!
NIE POWTARZAJ już napisanych sekcji!
KONTYNUUJ od miejsca gdzie skończył poprzedni pisarz!
`
    : ""
}

═══════════════════════════════════════════════════════════════
${hasUserSources ? "MATERIAŁY (UŻYTKOWNIK + GOOGLE):" : "ŹRÓDŁA:"}
═══════════════════════════════════════════════════════════════

${sources.substring(0, 50000)}

═══════════════════════════════════════════════════════════════
🎯 NAPISZ PEŁNĄ TREŚĆ dla ${writerAssignment.sections} (${targetLength} znaków):
═══════════════════════════════════════════════════════════════`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  // 🔍 DEBUG API RESPONSE
  console.log(`\n🔍🔍🔍 DEBUG API RESPONSE 🔍🔍🔍`);
  console.log(`   stop_reason: ${message.stop_reason}`);
  console.log(`   input_tokens: ${message.usage?.input_tokens}`);
  console.log(`   output_tokens: ${message.usage?.output_tokens}`);
  console.log(`   max_tokens wysłane: ${maxTokens}`);
  if (message.stop_reason === "max_tokens") {
    console.log(`   ⚠️ UWAGA: Tekst UCIĘTY przez limit tokenów!`);
  }

  let response =
    message.content[0].type === "text" ? message.content[0].text : "";

  // 🔄 JEŚLI UCIĘTY - KONTYNUUJ OD MIEJSCA PRZERWANIA
  if (message.stop_reason === "max_tokens") {
    console.log(`   🔄 Uruchamiam kontynuację od miejsca przerwania...`);

    let attempts = 0;
    let missingSections: string[] = [];

    do {
      response = await continueFromTruncation(
        response,
        text,
        sources,
        writerAssignment.structure
      );

      // Przelicz missingSections
      const plannedH2Regex = /<h2[^>]*>([^<]*)<\/h2>/gi;
      const plannedH2Matches =
        writerAssignment.structure.match(plannedH2Regex) || [];
      const plannedH2List = plannedH2Matches.map((h: string) =>
        h.replace(/<[^>]*>/g, "").trim()
      );

      const writtenH2Matches = response.match(plannedH2Regex) || [];
      const writtenH2List = writtenH2Matches.map((h: string) =>
        h.replace(/<[^>]*>/g, "").trim()
      );

      missingSections = plannedH2List.filter(
        (planned: string) =>
          !writtenH2List.some(
            (written: string) =>
              written
                .toLowerCase()
                .includes(planned.toLowerCase().substring(0, 20)) ||
              planned
                .toLowerCase()
                .includes(written.toLowerCase().substring(0, 20))
          )
      );

      attempts++;
      console.log(
        `   🔄 Kontynuacja #${attempts}: brakuje jeszcze ${missingSections.length} sekcji`
      );
    } while (missingSections.length > 0 && attempts < 3);

    if (missingSections.length > 0) {
      console.log(
        `   ⚠️ Po ${attempts} próbach nadal brakuje: ${missingSections.join(
          ", "
        )}`
      );
    }
  }

  const actualLength = response.length;
  console.log(`\n📏 DŁUGOŚĆ WYGENEROWANEJ TREŚCI:`);
  console.log(`   Cel: ${targetLength} znaków`);
  console.log(`   Otrzymano: ${actualLength} znaków`);

  // ✅ TYLKO WERYFIKACJA CZY PRAWIDŁOWO ZAKOŃCZONY
  const verification = await verifyAndFixEnding(
    response,
    text.length,
    part?.number === part?.total,
    text.topic
  );

  const finalResponse = verification.fixed;

  // Logowanie wyników
  if (!verification.wasTruncated) {
    console.log(
      `   ✅ Prawidłowo zakończony - zachowano ${actualLength} znaków`
    );
  } else {
    console.log(
      `   ✂️ Poprawiono urwaną część - ${finalResponse.length} znaków`
    );
  }

  // Sprawdź czy nie za krótki
  const minExpected = Math.floor(targetLength * 0.8);
  if (actualLength < minExpected) {
    console.warn(
      `   ⚠️ UWAGA: Tekst krótszy niż oczekiwano (${actualLength} < ${minExpected})`
    );
  }

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
  existingWriterResponses.push(finalResponse);

  await prisma.text.update({
    where: { id: text.id },
    data: {
      writerPrompts: JSON.stringify(existingWriterPrompts),
      writerResponses: JSON.stringify(existingWriterResponses),
    },
  });
  await prisma.$disconnect();

  return finalResponse;
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
    if (!sources || sources === "") {
      console.warn(
        "⚠️ Brak źródeł - generowanie treści bez materiałów zewnętrznych"
      );
      // NIE rzucaj błędu - kontynuuj z pustym stringiem
    }

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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ŚCIEŻKA 1: < 10,000 znaków - JEDEN PISARZ (bez zmian)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (text.length < 10000) {
      console.log("📝 Tryb: Bezpośrednie pisanie HTML (< 10k znaków)");
      finalContent = await generateShortContent(text, sources);
      console.log(`✅ Wygenerowano ${finalContent.length} znaków HTML`);
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ŚCIEŻKA 2: 10k-50k znaków - KIEROWNIK + 1 PISARZ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (text.length < 50000) {
      console.log("📝 Tryb: Kierownik + Pisarz HTML (10k-50k znaków)");
      console.log("🔹 Kierownik: Tworzenie struktury HTML...");

      const structureData = await generateStructure(text, 1);
      console.log(`✅ Struktura HTML utworzona`);

      console.log("🔹 Pisarz: Generowanie treści HTML...");
      // ✅ FIX: Przekazujemy part aby SEO instrukcje zostały wygenerowane!
      finalContent = await generateWithStructure(
        text,
        structureData.writerAssignments[0],
        sources,
        {
          number: 1,
          total: 1,
        }
      );
      console.log(`✅ Wygenerowano ${finalContent.length} znaków HTML`);
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ŚCIEŻKA 3: >= 50k znaków - KIEROWNIK + DYNAMICZNI PISARZE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else {
      const writersNeeded = Math.ceil(text.length / 48000);
      const maxWriters = Math.min(writersNeeded, 7);

      console.log(
        `📝 Tryb: Kierownik + ${maxWriters} Pisarzy HTML (${text.length.toLocaleString()} znaków)`
      );

      console.log("🔹 Kierownik: Tworzenie struktury i podziału...");
      const structureData = await generateStructure(text, maxWriters);
      console.log(`✅ Struktura podzielona na ${maxWriters} pisarzy`);

      const parts: string[] = [];
      const completedSections: string[] = [];

      // ✅ GENERUJ CZĘŚCI SEKWENCYJNIE Z INFORMACJĄ CO JUŻ NAPISANE
      for (let i = 0; i < maxWriters; i++) {
        const assignment = structureData.writerAssignments[i];

        console.log(
          `🔹 Pisarz ${assignment.writer}/${maxWriters}: ${assignment.sections}...`
        );

        const previousContent =
          parts.length > 0
            ? parts
                .join("\n\n")
                .substring(Math.max(0, parts.join("\n\n").length - 5000))
            : undefined;

        const part = await generateWithStructure(text, assignment, sources, {
          number: assignment.writer,
          total: maxWriters,
          previousContent,
          completedSections: [...completedSections], // ✅ LISTA SEKCJI JUŻ NAPISANYCH
        });

        console.log(
          `✅ Część ${assignment.writer}: ${part.length} znaków HTML`
        );
        parts.push(part);

        // ✅ DODAJ DO LISTY UKOŃCZONYCH SEKCJI
        completedSections.push(assignment.sections);
      }

      finalContent = parts.join("\n\n");
      console.log(
        `✅ Łącznie: ${finalContent.length} znaków HTML (${maxWriters} części)`
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // 🆕 POST-PROCESSING: WALIDACJA I NAPRAWY KOŃCOWE
    // ═══════════════════════════════════════════════════════════════

    // 1. Walidacja zakończenia (Claude sprawdza czy nie urwane)
    console.log(`\n📋 POST-PROCESSING...`);
    const endingValidation = await verifyAndFixEnding(
      finalContent,
      text.length,
      true,
      text.topic
    );
    finalContent = endingValidation.fixed;

    // 2. Walidacja i uzupełnienie linków SEO
    const seoLinks = text.seoLinks ? JSON.parse(text.seoLinks) : [];
    if (seoLinks.length > 0) {
      const linkValidation = validateSeoLinks(finalContent, seoLinks);

      if (!linkValidation.valid && linkValidation.missingLinks.length > 0) {
        console.log(
          `\n⚠️ BRAKUJE ${linkValidation.missingLinks.length} LINKÓW SEO!`
        );

        // Spróbuj dodać brakujące linki
        finalContent = await addMissingSeoLinks(
          finalContent,
          linkValidation.missingLinks
        );

        // Re-walidacja
        const reValidation = validateSeoLinks(finalContent, seoLinks);
        if (reValidation.valid) {
          console.log(`✅ Wszystkie linki SEO dodane`);
        } else {
          console.log(
            `⚠️ Nadal brakuje ${reValidation.missingLinks.length} linków - warning`
          );
        }
      } else {
        console.log(`✅ Wszystkie ${seoLinks.length} linki SEO są w tekście`);
      }
    }

    console.log(`📋 POST-PROCESSING ZAKOŃCZONY\n`);

    // Zapisz wygenerowaną treść (bez zmian)
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 KALKULUJ STRUKTURĘ ZAMIAST ZNAKÓW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function calculateContentStructure(targetChars: number): {
  words: number;
  paragraphs: number;
  sections: number;
  wordsPerParagraph: number;
  paragraphsPerSection: number;
  example: string;
} {
  // Polski: ~6.5 znaków na słowo (ze spacjami)
  const words = Math.round(targetChars / 6.5);

  // ~100 słów na akapit (4-5 zdań)
  const paragraphs = Math.round(words / 100);

  // ~3 akapity na sekcję H2
  const sections = Math.max(2, Math.round(paragraphs / 3));

  const wordsPerParagraph = Math.round(words / paragraphs);
  const paragraphsPerSection = Math.round(paragraphs / sections);

  // Przykład akapitu ~100 słów (650 znaków)
  const example = `<p>To jest przykładowy akapit o długości około stu słów, który pokazuje jak powinien wyglądać typowy akapit w Twoim tekście. Każdy akapit powinien zawierać od czterech do pięciu pełnych zdań, które rozwijają jedną myśl lub koncept. Pamiętaj, że akapit nie powinien być ani za krótki (jedno zdanie), ani za długi (więcej niż siedem zdań). Staraj się zachować podobną długość wszystkich akapitów w tekście, co zapewni czytelnikowi komfort czytania i ułatwi przyswajanie informacji. Ten przykładowy akapit ma właśnie około stu słów.</p>`;

  return {
    words,
    paragraphs,
    sections,
    wordsPerParagraph,
    paragraphsPerSection,
    example,
  };
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
