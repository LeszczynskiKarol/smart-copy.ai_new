// backend/src/services/stripe.service.ts
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { processOrder } from "./textGenerationService";
import { sendOrderNotificationToSlack } from "./slackNotificationService";

// ✅ Lazy initialization - tworzy stripe dopiero gdy jest potrzebny
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY nie jest ustawiony w .env");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }
  return stripeInstance;
}

export class StripeService {
  async createDepositSession(userId: string, amount: number, orderId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (amount < 5) {
      throw new Error("Minimalna kwota doładowania to 5 PLN");
    }

    // OBLICZ RABAT
    let discount = 0;
    if (amount >= 500) {
      discount = 0.3; // 30%
    } else if (amount >= 200) {
      discount = 0.2; // 20%
    } else if (amount >= 100) {
      discount = 0.1; // 10%
    }

    const discountAmount = amount * discount;
    const finalPrice = amount - discountAmount;
    const creditAmount = amount;

    // RÓŻNE URL DLA ZAMÓWIENIA VS DOŁADOWANIA
    const cancelUrl = orderId
      ? `${process.env.FRONTEND_URL}/orders?payment=cancelled&orderId=${orderId}`
      : `${process.env.FRONTEND_URL}/deposit?payment=cancelled`;

    const successUrl = orderId
      ? `${process.env.FRONTEND_URL}/orders?payment=success&orderId=${orderId}`
      : `${process.env.FRONTEND_URL}/dashboard?payment=success&amount=${creditAmount}`;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "blik"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: orderId
                ? "Doładowanie konta + Zamówienie"
                : `Doładowanie konta Smart-Copy.ai${
                    discount > 0
                      ? ` (Rabat ${(discount * 100).toFixed(0)}%)`
                      : ""
                  }`,
              description: orderId
                ? `Środki na realizację zamówienia`
                : discount > 0
                ? `Doładowanie: ${creditAmount.toFixed(
                    2
                  )} zł • Rabat: -${discountAmount.toFixed(
                    2
                  )} zł • Do zapłaty: ${finalPrice.toFixed(2)} zł`
                : "Dodanie środków na konto",
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        orderId: orderId || "",
        type: "deposit",
        creditAmount: creditAmount.toString(),
        paidAmount: finalPrice.toFixed(2),
        discountPercent: (discount * 100).toFixed(0),
      },
    });

    return session;
  }

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const orderId = session.metadata?.orderId;
    const creditAmount = parseFloat(session.metadata?.creditAmount || "0");
    const paidAmount = parseFloat(session.metadata?.paidAmount || "0");
    const discountPercent = session.metadata?.discountPercent || "0";

    if (!userId || creditAmount === 0) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const balanceBefore = parseFloat(user.balance.toString());
    const balanceAfter = balanceBefore + creditAmount;

    // Dodaj transakcję doładowania
    await prisma.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        amount: creditAmount,
        balanceBefore,
        balanceAfter,
        stripeSessionId: session.id,
        description:
          discountPercent !== "0"
            ? `Doładowanie konta przez Stripe (rabat ${discountPercent}% • zapłacono ${paidAmount.toFixed(
                2
              )} zł)`
            : "Doładowanie konta przez Stripe",
      },
    });

    // Zaktualizuj saldo
    await prisma.user.update({
      where: { id: userId },
      data: { balance: balanceAfter },
    });

    // ✅ Jeśli to było doładowanie pod zamówienie
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          texts: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (order && order.status === "PENDING") {
        const orderPrice = parseFloat(order.totalPrice.toString());
        const newBalance = balanceAfter - orderPrice;

        // Pobierz środki za zamówienie
        await prisma.transaction.create({
          data: {
            userId,
            orderId,
            type: "ORDER_PAYMENT",
            amount: -orderPrice,
            balanceBefore: balanceAfter,
            balanceAfter: newBalance,
            description: `Płatność za zamówienie ${order.orderNumber}`,
          },
        });

        // Zaktualizuj saldo i status zamówienia
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { balance: newBalance },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: "IN_PROGRESS" },
          }),
        ]);

        // <<<< DODAJ POWIADOMIENIE SLACK >>>>
        try {
          await sendOrderNotificationToSlack({
            orderNumber: order.orderNumber,
            orderId: order.id,
            userEmail: order.user.email,
            totalPrice: orderPrice.toFixed(2),
            textsCount: order.texts.length,
            texts: order.texts.map((t) => ({
              topic: t.topic,
              length: t.length,
              language: t.language,
              textType: t.textType,
            })),
          });
        } catch (error) {
          console.error("❌ Slack notification failed:", error);
        }

        // ✅✅✅ URUCHOM PRZETWARZANIE ZAMÓWIENIA
        console.log(`\n🚀🚀🚀 URUCHAMIAM PRZETWARZANIE ZAMÓWIENIA ${orderId}`);

        processOrder(orderId)
          .then(() => {
            console.log(`✅ Zamówienie ${orderId} przetworzone`);
          })
          .catch((error) => {
            console.error(
              `❌ Błąd przetwarzania zamówienia ${orderId}:`,
              error
            );
          });
      }
    }
  }
}
