import { equipSchema, unequipSchema } from "@prooflayer/shared";
import type { FastifyInstance } from "fastify";
import { loadCharacterState } from "../character.js";
import { env } from "../env.js";
import {
  equipItem,
  ItemNotInInventoryError,
  ItemSlotMismatchError,
  SlotEmptyError,
  unequipSlot,
} from "../equipment.js";
import { viewCharacter } from "../serialize.js";

export async function equipmentRoutes(app: FastifyInstance) {
  app.post("/api/equipment/equip", async (req, reply) => {
    const parsed = equipSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    try {
      await equipItem(env.DEV_CHARACTER_ID, parsed.data.slot, parsed.data.itemId);
      const state = await loadCharacterState(env.DEV_CHARACTER_ID);
      return { character: viewCharacter(state) };
    } catch (e) {
      if (e instanceof ItemNotInInventoryError) {
        return reply.code(400).send({ error: e.message });
      }
      if (e instanceof ItemSlotMismatchError) {
        return reply.code(400).send({ error: e.message });
      }
      throw e;
    }
  });

  app.post("/api/equipment/unequip", async (req, reply) => {
    const parsed = unequipSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    try {
      await unequipSlot(env.DEV_CHARACTER_ID, parsed.data.slot);
      const state = await loadCharacterState(env.DEV_CHARACTER_ID);
      return { character: viewCharacter(state) };
    } catch (e) {
      if (e instanceof SlotEmptyError) {
        return reply.code(400).send({ error: e.message });
      }
      throw e;
    }
  });
}
