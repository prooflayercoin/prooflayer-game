import type { FastifyInstance } from "fastify";
import { loadCharacterState, tickAndPersist } from "../character.js";
import { env } from "../env.js";
import { viewCharacter } from "../serialize.js";

export async function stateRoutes(app: FastifyInstance) {
  app.get("/api/state", async () => {
    const { state } = await tickAndPersist(env.DEV_CHARACTER_ID);
    return { character: viewCharacter(state) };
  });

  app.get("/api/state/raw", async () => {
    const state = await loadCharacterState(env.DEV_CHARACTER_ID);
    return { character: viewCharacter(state) };
  });
}
