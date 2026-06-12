import cors from "@fastify/cors";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { env } from "./env.js";
import { actionRoutes } from "./routes/action.js";
import { authRoutes } from "./routes/auth.js";
import { characterRoutes } from "./routes/characters.js";
import { configRoutes } from "./routes/config.js";
import { equipmentRoutes } from "./routes/equipment.js";
import { healthRoutes } from "./routes/health.js";
import { stateRoutes } from "./routes/state.js";
import { worldRoutes } from "./routes/worlds.js";
import { worldSocketRoutes } from "./world/socket.js";

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "test"
        ? false
        : {
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
  await app.register(websocket);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(characterRoutes);
  await app.register(worldRoutes);
  await app.register(configRoutes);
  await app.register(stateRoutes);
  await app.register(actionRoutes);
  await app.register(equipmentRoutes);
  await app.register(worldSocketRoutes);

  return app;
}
