import { createCharacterSchema } from "@prooflayer/shared";
import type { FastifyInstance } from "fastify";
import { AuthError, createStarterCharacter, requireAccount } from "../auth.js";
import { prisma } from "../db.js";

function summary(character: {
  id: string;
  name: string;
  worldId: string;
  regionId: string;
  tileX: number;
  tileY: number;
}) {
  return {
    id: character.id,
    name: character.name,
    worldId: character.worldId,
    regionId: character.regionId,
    position: { regionId: character.regionId, x: character.tileX, y: character.tileY },
  };
}

export async function characterRoutes(app: FastifyInstance) {
  app.get("/api/characters", async (req, reply) => {
    try {
      const account = await requireAccount(req);
      const characters = await prisma.character.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: "asc" },
      });
      return { characters: characters.map(summary) };
    } catch (e) {
      if (e instanceof AuthError) return reply.code(401).send({ error: e.message });
      throw e;
    }
  });

  app.post("/api/characters", async (req, reply) => {
    const parsed = createCharacterSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    try {
      const account = await requireAccount(req);
      const character = await createStarterCharacter(account.id, parsed.data.name);
      return { character: summary(character) };
    } catch (e) {
      if (e instanceof AuthError) return reply.code(401).send({ error: e.message });
      throw e;
    }
  });
}
