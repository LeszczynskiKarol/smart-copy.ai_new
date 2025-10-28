// backend/src/routes/stripe.routes.ts:

import { FastifyInstance, FastifyRequest } from "fastify";
import { StripeService } from "../services/stripe.service";
import Stripe from "stripe";

const stripeService = new StripeService();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export const stripeRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/webhook", async (request: FastifyRequest, reply) => {
    fastify.log.info("🔔 Webhook endpoint hit");

    const signature = request.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      fastify.log.error("❌ Missing Stripe signature");
      return reply.code(400).send({ error: "Missing Stripe signature" });
    }

    // rawBody z fastify-raw-body plugin
    const rawBody = (request as any).rawBody;

    if (!rawBody) {
      fastify.log.error("❌ Missing raw body");
      return reply.code(400).send({ error: "Missing raw body" });
    }

    fastify.log.info(`Raw body type: ${typeof rawBody}`);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      fastify.log.info(`✅ Webhook received: ${event.type}`);
    } catch (err: any) {
      fastify.log.error(`❌ Webhook verification failed: ${err.message}`);
      return reply.code(400).send({
        error: `Webhook verification failed: ${err.message}`,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        await stripeService.handleSuccessfulPayment(session);
        fastify.log.info(`✅ Payment processed for session: ${session.id}`);
      } catch (err: any) {
        fastify.log.error(`❌ Payment processing error: ${err.message}`);
        return reply.code(500).send({ error: "Payment processing error" });
      }
    }

    return { received: true };
  });
};
