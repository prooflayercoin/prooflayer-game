export type SkillId =
  | "reaping"
  | "quarrying"
  | "tempering"
  | "tracking"
  | "distilling"
  | "sealing";

export const SKILL_IDS: SkillId[] = [
  "reaping",
  "quarrying",
  "tempering",
  "tracking",
  "distilling",
  "sealing",
];

export type EquipmentSlot =
  | "head"
  | "body"
  | "hands"
  | "feet"
  | "weapon"
  | "accessory";

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  "head",
  "body",
  "hands",
  "feet",
  "weapon",
  "accessory",
];

export type ItemCategory =
  | "material"
  | "consumable"
  | "equipment"
  | "token";

export interface DropEntry {
  itemId: string;
  min: number;
  max: number;
  chance: number;
}

export interface ActionConfig {
  id: string;
  skillId: SkillId;
  name: string;
  description: string;
  levelRequired: number;
  durationMs: number;
  xpReward: number;
  goldReward: number;
  drops: DropEntry[];
}

export interface ItemConfig {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  slot?: EquipmentSlot;
  baseValue: number;
}

export interface SkillConfig {
  id: SkillId;
  name: string;
  tagline: string;
  description: string;
}

export interface CharacterState {
  id: string;
  name: string;
  gold: bigint;
  lastTickAt: Date;
  activeActionId: string | null;
  activeProgressMs: number;
  rngSeed: number;
  skills: Record<SkillId, { xp: bigint }>;
  inventory: Record<string, bigint>;
  equipment: Record<EquipmentSlot, string | null>;
}

export type TickEvent =
  | {
      kind: "action_completed";
      actionId: string;
      completions: number;
      xpGained: number;
      goldGained: number;
      drops: Array<{ itemId: string; quantity: number }>;
    }
  | {
      kind: "offline_capped";
      cappedMs: number;
      actualMs: number;
    }
  | {
      kind: "action_cleared_invalid";
      actionId: string;
    };

export interface TickResult {
  state: CharacterState;
  events: TickEvent[];
}
