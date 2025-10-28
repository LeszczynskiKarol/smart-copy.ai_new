// backend/src/types/fastify.d.ts

import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

// Dodaj osobny plik dla content parser:
declare global {
  namespace NodeJS {
    interface Buffer {}
  }
}
