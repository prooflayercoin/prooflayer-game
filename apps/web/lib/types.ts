export interface ActiveActionView {
  actionId: string;
  name: string;
  skillId: string;
  durationMs: number;
  progressMs: number;
  progress: number;
  msRemaining: number;
}

export interface SkillView {
  id: string;
  name: string;
  tagline: string;
  xp: string;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

export interface InventoryEntryView {
  itemId: string;
  name: string;
  category: string;
  quantity: string;
}

export interface EquipmentSlotView {
  slot: string;
  itemId: string | null;
  name: string | null;
}

export interface CharacterView {
  id: string;
  name: string;
  gold: string;
  worldId: string;
  regionId: string;
  position: { regionId: string; x: number; y: number };
  hp: number;
  maxHp: number;
  totalLevel: number;
  totalXp: string;
  activeAction: ActiveActionView | null;
  skills: SkillView[];
  inventory: InventoryEntryView[];
  equipment: EquipmentSlotView[];
}

export interface ActionView {
  id: string;
  skillId: string;
  name: string;
  description: string;
  levelRequired: number;
  durationMs: number;
  xpReward: number;
  goldReward: number;
  drops: { itemId: string; name: string; min: number; max: number; chance: number }[];
}

export interface SkillBlock {
  id: string;
  name: string;
  tagline: string;
  description: string;
  actions: ActionView[];
}

export interface GameConfig {
  version: string;
  skillIds: string[];
  skillOrder: string[];
  skills: SkillBlock[];
  items: Record<
    string,
    {
      id: string;
      name: string;
      description: string;
      category: string;
      slot?: string;
      baseValue: number;
    }
  >;
}
