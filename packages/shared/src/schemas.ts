import { z } from "zod";
import type { RegionId, WorldId } from "./world.js";

export const emailSchema = z.string().trim().email().max(254).transform((v) => v.toLowerCase());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  characterName: z.string().trim().min(3).max(24).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createCharacterSchema = z.object({
  name: z.string().trim().min(3).max(24),
});
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export const startActionSchema = z.object({
  actionId: z.string().min(1).max(64),
});
export type StartActionInput = z.infer<typeof startActionSchema>;

export const equipSchema = z.object({
  slot: z.enum(["head", "body", "hands", "feet", "weapon", "accessory"]),
  itemId: z.string().min(1).max(64),
});
export type EquipInput = z.infer<typeof equipSchema>;

export const unequipSchema = z.object({
  slot: z.enum(["head", "body", "hands", "feet", "weapon", "accessory"]),
});
export type UnequipInput = z.infer<typeof unequipSchema>;

export const regionIdSchema = z.enum([
  "market_cross",
  "west_aether_grove",
  "eastern_quarry",
  "market_hall_interior",
]) satisfies z.ZodType<RegionId>;

export const worldIdSchema = z
  .string()
  .regex(/^world-\d+$/)
  .transform((value) => value as WorldId);

export const worldPositionSchema = z.object({
  regionId: regionIdSchema,
  x: z.number().int().min(0).max(512),
  y: z.number().int().min(0).max(512),
});

export const worldClientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join_world"),
    worldId: worldIdSchema,
    characterId: z.string().min(1).max(128),
  }),
  z.object({
    type: z.literal("move_to"),
    requestId: z.string().min(1).max(128),
    to: worldPositionSchema,
  }),
  z.object({
    type: z.literal("interact_entity"),
    requestId: z.string().min(1).max(128),
    entityId: z.string().min(1).max(128),
  }),
  z.object({
    type: z.literal("attack_entity"),
    requestId: z.string().min(1).max(128),
    entityId: z.string().min(1).max(128),
  }),
  z.object({
    type: z.literal("chat_local"),
    requestId: z.string().min(1).max(128),
    text: z.string().trim().min(1).max(180),
  }),
  z.object({
    type: z.literal("logout"),
  }),
]);
