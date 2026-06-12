import type { FastifyInstance } from "fastify";
import { accountFromRequest } from "../auth.js";
import { worldRuntime } from "./runtime.js";

export async function worldSocketRoutes(app: FastifyInstance) {
  app.get("/ws/world", { websocket: true }, async (socket, req) => {
    const account = await accountFromRequest(req);
    const worldId = typeof req.query === "object" && req.query && "worldId" in req.query
      ? String((req.query as { worldId?: unknown }).worldId)
      : "";

    if (!account) {
      socket.send(
        JSON.stringify({
          type: "error",
          code: "auth_required",
          message: "Sign in before joining a world",
        })
      );
      socket.close();
      return;
    }

    await worldRuntime.handleConnection(socket, account.id, worldId || "world-1");
  });

  app.addHook("onClose", async () => {
    worldRuntime.close();
  });
}
