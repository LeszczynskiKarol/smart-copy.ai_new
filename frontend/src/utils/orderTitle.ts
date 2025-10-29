// frontend/src/utils/orderTitle.ts

// Helper do kapitalizacji pierwszej litery
export function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getOrderTitle(order: {
  texts: Array<{ topic: string }>;
}): string {
  if (!order.texts || order.texts.length === 0) {
    return "Zamówienie";
  }

  const firstTopic = order.texts[0].topic;
  const textsCount = order.texts.length;

  // ✅ 1 TEKST - oryginalna logika (max 5 słów + kapitalizacja)
  if (textsCount === 1) {
    const words = firstTopic.split(" ");
    if (words.length <= 5) {
      return capitalizeFirstLetter(firstTopic);
    }
    const truncated = words.slice(0, 5).join(" ") + "...";
    return capitalizeFirstLetter(truncated);
  }

  // ✅ 2+ TEKSTY - skróć do 3 słów + "X więcej"
  const words = firstTopic.split(" ");
  const shortFirst =
    words.length <= 3
      ? capitalizeFirstLetter(firstTopic)
      : capitalizeFirstLetter(words.slice(0, 3).join(" ") + "...");

  const remaining = textsCount - 1;

  if (textsCount === 2) {
    return `${shortFirst} + 1 więcej`;
  }

  return `${shortFirst} + ${remaining} więcej`;
}

// Dla długiego tytułu (bez skracania)
export function getOrderFullTitle(order: {
  texts: Array<{ topic: string }>;
}): string {
  if (!order.texts || order.texts.length === 0) {
    return "Zamówienie";
  }
  return capitalizeFirstLetter(order.texts[0].topic);
}
