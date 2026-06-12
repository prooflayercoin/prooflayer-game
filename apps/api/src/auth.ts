import type { FastifyReply, FastifyRequest } from "fastify";
import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { EQUIPMENT_SLOTS, SKILL_IDS } from "@prooflayer/shared";
import { prisma } from "./db.js";
import { env } from "./env.js";

const SESSION_COOKIE = "prooflayer_session";
const SESSION_DAYS = 14;
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEYLEN = 32;
const PASSWORD_DIGEST = "sha256";

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
  }
}

export interface SessionAccount {
  id: string;
  email: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
  }

  return cookies;
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEYLEN,
    PASSWORD_DIGEST
  ).toString("hex");
  return `pbkdf2:${PASSWORD_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [method, iterations, salt, expected] = stored.split(":");
  if (method !== "pbkdf2" || !iterations || !salt || !expected) return false;

  const actual = pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    PASSWORD_KEYLEN,
    PASSWORD_DIGEST
  );
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actual.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actual, expectedBuffer);
}

export async function createStarterCharacter(accountId: string, name: string) {
  return prisma.character.create({
    data: {
      id: `char_${randomUUID()}`,
      accountId,
      name,
      worldId: "world-1",
      regionId: "market_cross",
      tileX: 32,
      tileY: 32,
      hp: 10,
      maxHp: 10,
      gold: 0n,
      activeActionId: null,
      activeProgressMs: 0,
      rngSeed: Math.floor(Math.random() * 0x7fffffff),
      skills: {
        create: SKILL_IDS.map((skillId) => ({ skillId, xp: 0n })),
      },
      equipment: {
        create: EQUIPMENT_SLOTS.map((slot) => {
          const starter: Record<string, string | null> = {
            weapon: "apprentice_blade",
            body: "apprentice_robe",
            feet: "apprentice_boots",
          };
          return { slot, itemId: starter[slot] ?? null };
        }),
      },
    },
  });
}

export async function createSession(accountId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      accountId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });
  return token;
}

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.header(
    "set-cookie",
    serializeCookie(SESSION_COOKIE, token, SESSION_DAYS * 24 * 60 * 60)
  );
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.header("set-cookie", serializeCookie(SESSION_COOKIE, "", 0));
}

export function sessionTokenFromRequest(req: FastifyRequest): string | null {
  return parseCookies(req.headers.cookie)[SESSION_COOKIE] ?? null;
}

export async function accountFromRequest(req: FastifyRequest): Promise<SessionAccount | null> {
  const token = sessionTokenFromRequest(req);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { account: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return { id: session.account.id, email: session.account.email };
}

export async function requireAccount(req: FastifyRequest): Promise<SessionAccount> {
  const account = await accountFromRequest(req);
  if (!account) throw new AuthError();
  return account;
}

export async function deleteSession(req: FastifyRequest): Promise<void> {
  const token = sessionTokenFromRequest(req);
  if (!token) return;
  await prisma.session
    .delete({ where: { tokenHash: hashToken(token) } })
    .catch(() => undefined);
}

export async function characterIdForRequest(req: FastifyRequest): Promise<string> {
  const account = await accountFromRequest(req);
  if (!account) return env.DEV_CHARACTER_ID;

  const character = await prisma.character.findFirst({
    where: { accountId: account.id },
    orderBy: { createdAt: "asc" },
  });
  return character?.id ?? env.DEV_CHARACTER_ID;
}
