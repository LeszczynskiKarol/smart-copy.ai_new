// frontend/src/utils/orderTitle.ts

// Helper do kapitalizacji pierwszej litery
function capitalizeFirstLetter(text: string): string {
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
  const words = firstTopic.split(" ");

  if (words.length <= 5) {
    return capitalizeFirstLetter(firstTopic);
  }

  const truncated = words.slice(0, 5).join(" ") + "...";
  return capitalizeFirstLetter(truncated);
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
