import type { FastifyInstance } from "fastify";
import { loadCharacterState, tickAndPersist } from "../character.js";
import { characterIdForRequest } from "../auth.js";
import { viewCharacter } from "../serialize.js";

export async function stateRoutes(app: FastifyInstance) {
  app.get("/api/state", async (req) => {
    const characterId = await characterIdForRequest(req);
    const { state } = await tickAndPersist(characterId);
    return { character: viewCharacter(state) };
  });

  app.get("/api/state/raw", async (req) => {
    const characterId = await characterIdForRequest(req);
    const state = await loadCharacterState(characterId);
    return { character: viewCharacter(state) };
  });
}
