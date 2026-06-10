import cors from "@fastify/cors";
import Fastify from "fastify";
import { env } from "./env.js";
import { actionRoutes } from "./routes/action.js";
import { configRoutes } from "./routes/config.js";
import { equipmentRoutes } from "./routes/equipment.js";
import { healthRoutes } from "./routes/health.js";
import { stateRoutes } from "./routes/state.js";

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss" } }
        : undefined,
  },
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(healthRoutes);
await app.register(configRoutes);
await app.register(stateRoutes);
await app.register(actionRoutes);
await app.register(equipmentRoutes);

try {
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`Prooflayer API listening on ${env.API_HOST}:${env.API_PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
