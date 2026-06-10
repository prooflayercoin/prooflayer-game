import { z } from "zod";

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
