import { loginSchema, registerSchema } from "@prooflayer/shared";
import type { FastifyInstance } from "fastify";
import {
  AuthError,
  clearSessionCookie,
  createSession,
  createStarterCharacter,
  deleteSession,
  hashPassword,
  requireAccount,
  setSessionCookie,
  verifyPassword,
} from "../auth.js";
import { prisma } from "../db.js";

function characterSummary(character: {
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
    position: {
      regionId: character.regionId,
      x: character.tileX,
      y: character.tileY,
    },
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const { email, password, characterName } = parsed.data;
    const existing = await prisma.account.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: "Account already exists" });

    const account = await prisma.account.create({
      data: {
        email,
        passwordHash: hashPassword(password),
      },
    });
    const character = await createStarterCharacter(account.id, characterName ?? "Apprentice");
    const token = await createSession(account.id);
    setSessionCookie(reply, token);

    return {
      account: { id: account.id, email: account.email },
      characters: [characterSummary(character)],
    };
  });

  app.post("/api/auth/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const account = await prisma.account.findUnique({
      where: { email: parsed.data.email },
      include: { characters: { orderBy: { createdAt: "asc" } } },
    });
    if (!account || !verifyPassword(parsed.data.password, account.passwordHash)) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    const token = await createSession(account.id);
    setSessionCookie(reply, token);
    return {
      account: { id: account.id, email: account.email },
      characters: account.characters.map(characterSummary),
    };
  });

  app.post("/api/auth/logout", async (req, reply) => {
    await deleteSession(req);
    clearSessionCookie(reply);
    return { ok: true };
  });

  app.get("/api/session", async (req, reply) => {
    try {
      const account = await requireAccount(req);
      const characters = await prisma.character.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: "asc" },
      });
      return {
        account,
        characters: characters.map(characterSummary),
      };
    } catch (e) {
      if (e instanceof AuthError) return reply.code(401).send({ account: null, characters: [] });
      throw e;
    }
  });
}
