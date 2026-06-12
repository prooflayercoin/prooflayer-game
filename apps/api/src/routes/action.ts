import { startActionSchema } from "@prooflayer/shared";
import type { FastifyInstance } from "fastify";
import {
  ActionNotFoundError,
  LevelRequirementError,
  startAction,
  stopAction,
} from "../character.js";
import { characterIdForRequest } from "../auth.js";
import { viewCharacter } from "../serialize.js";

export async function actionRoutes(app: FastifyInstance) {
  app.post("/api/action/start", async (req, reply) => {
    const parsed = startActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    try {
      const characterId = await characterIdForRequest(req);
      const state = await startAction(characterId, parsed.data.actionId);
      return { character: viewCharacter(state) };
    } catch (e) {
      if (e instanceof ActionNotFoundError) {
        return reply.code(404).send({ error: e.message });
      }
      if (e instanceof LevelRequirementError) {
        return reply.code(400).send({
          error: e.message,
          required: e.required,
          actual: e.actual,
        });
      }
      throw e;
    }
  });

  app.post("/api/action/stop", async (req) => {
    const characterId = await characterIdForRequest(req);
    const state = await stopAction(characterId);
    return { character: viewCharacter(state) };
  });
}
