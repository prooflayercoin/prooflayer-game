import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/healthz", async () => ({ ok: true }));
  app.get("/readyz", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false, db: "unreachable" });
    }
  });
}
