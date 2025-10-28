// backend/src/services/slackNotificationService.ts
import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface OrderNotification {
  orderNumber: string;
  orderId: string; // <<<< DODAJ TO
  userEmail: string;
  totalPrice: string;
  textsCount: number;
  texts: Array<{
    topic: string;
    length: number;
    language: string;
    textType: string;
  }>;
}

export async function sendOrderNotificationToSlack(
  order: OrderNotification
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("⚠️ SLACK_WEBHOOK_URL not configured - skipping notification");
    return;
  }

  try {
    // Link do zamówienia w panelu admina
    const orderUrl = `${FRONTEND_URL}/admin/orders/${order.orderId}`;

    // Teksty z linkami
    const textsList = order.texts
      .map(
        (t, i) =>
          `${i + 1}. <${orderUrl}|*${
            t.topic
          }*> (${t.length.toLocaleString()} znaków, ${t.language}, ${
            t.textType
          })`
      )
      .join("\n");

    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎉 Nowe zamówienie!",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Numer:*\n<${orderUrl}|${order.orderNumber}>`, // <<<< Link też na numerze
            },
            {
              type: "mrkdwn",
              text: `*Użytkownik:*\n${order.userEmail}`,
            },
            {
              type: "mrkdwn",
              text: `*Cena:*\n${order.totalPrice} zł`,
            },
            {
              type: "mrkdwn",
              text: `*Liczba tekstów:*\n${order.textsCount}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Teksty do wygenerowania:*\n${textsList}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "🔗 Otwórz zamówienie",
                emoji: true,
              },
              url: orderUrl,
              style: "primary",
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ ${new Date().toLocaleString("pl-PL")}`,
            },
          ],
        },
      ],
    };

    await axios.post(SLACK_WEBHOOK_URL, message, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    console.log(`✅ Powiadomienie Slack wysłane: ${order.orderNumber}`);
  } catch (error: any) {
    console.error("❌ Błąd wysyłki powiadomienia Slack:", error.message);
  }
}

// Powiadomienie o zakończeniu zamówienia
export async function sendOrderCompletedNotificationToSlack(
  order: OrderNotification
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    const orderUrl = `${FRONTEND_URL}/admin/orders/${order.orderId}`;

    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Zamówienie ukończone!",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Numer:*\n<${orderUrl}|${order.orderNumber}>`,
            },
            {
              type: "mrkdwn",
              text: `*Użytkownik:*\n${order.userEmail}`,
            },
            {
              type: "mrkdwn",
              text: `*Tekstów:*\n${order.textsCount}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "🔗 Zobacz zamówienie",
                emoji: true,
              },
              url: orderUrl,
              style: "primary",
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ ${new Date().toLocaleString("pl-PL")}`,
            },
          ],
        },
      ],
    };

    await axios.post(SLACK_WEBHOOK_URL, message, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    console.log(`✅ Powiadomienie Slack (ukończone): ${order.orderNumber}`);
  } catch (error: any) {
    console.error("❌ Błąd wysyłki powiadomienia Slack:", error.message);
  }
}
