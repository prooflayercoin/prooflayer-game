import { ACTIONS, ITEMS, SKILLS } from "@prooflayer/config";
import {
  levelForXp,
  levelProgress,
  SKILL_IDS,
  type CharacterState,
  type SkillId,
} from "@prooflayer/shared";

interface SkillView {
  id: SkillId;
  name: string;
  tagline: string;
  xp: string;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

interface ActiveActionView {
  actionId: string;
  name: string;
  skillId: SkillId;
  durationMs: number;
  progressMs: number;
  progress: number;
  msRemaining: number;
}

interface InventoryEntryView {
  itemId: string;
  name: string;
  category: string;
  quantity: string;
}

interface EquipmentSlotView {
  slot: string;
  itemId: string | null;
  name: string | null;
}

export interface CharacterView {
  id: string;
  name: string;
  gold: string;
  totalLevel: number;
  totalXp: string;
  activeAction: ActiveActionView | null;
  skills: SkillView[];
  inventory: InventoryEntryView[];
  equipment: EquipmentSlotView[];
}

export function viewCharacter(state: CharacterState): CharacterView {
  const skills: SkillView[] = SKILL_IDS.map((id) => {
    const xp = state.skills[id].xp;
    const lp = levelProgress(xp);
    const cfg = SKILLS[id];
    return {
      id,
      name: cfg.name,
      tagline: cfg.tagline,
      xp: xp.toString(),
      level: lp.level,
      xpIntoLevel: lp.xpIntoLevel,
      xpForNextLevel: lp.xpForNextLevel,
      progress: lp.progress,
    };
  });

  const totalLevel = skills.reduce((sum, s) => sum + s.level, 0);
  const totalXp = SKILL_IDS.reduce(
    (sum, id) => sum + state.skills[id].xp,
    0n
  ).toString();

  let activeAction: ActiveActionView | null = null;
  if (state.activeActionId) {
    const a = ACTIONS[state.activeActionId];
    if (a) {
      const msRemaining = Math.max(0, a.durationMs - state.activeProgressMs);
      activeAction = {
        actionId: a.id,
        name: a.name,
        skillId: a.skillId,
        durationMs: a.durationMs,
        progressMs: state.activeProgressMs,
        progress:
          a.durationMs === 0 ? 0 : state.activeProgressMs / a.durationMs,
        msRemaining,
      };
    }
  }

  const inventory: InventoryEntryView[] = Object.entries(state.inventory)
    .filter(([, q]) => q > 0n)
    .map(([itemId, quantity]) => {
      const item = ITEMS[itemId];
      return {
        itemId,
        name: item?.name ?? itemId,
        category: item?.category ?? "material",
        quantity: quantity.toString(),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const equipment: EquipmentSlotView[] = Object.entries(state.equipment).map(
    ([slot, itemId]) => ({
      slot,
      itemId,
      name: itemId ? ITEMS[itemId]?.name ?? itemId : null,
    })
  );

  return {
    id: state.id,
    name: state.name,
    gold: state.gold.toString(),
    totalLevel,
    totalXp,
    activeAction,
    skills,
    inventory,
    equipment,
  };
}

export interface ActionView {
  id: string;
  skillId: SkillId;
  name: string;
  description: string;
  levelRequired: number;
  durationMs: number;
  xpReward: number;
  goldReward: number;
  drops: { itemId: string; name: string; min: number; max: number; chance: number }[];
}

export function viewActionsForSkill(skillId: SkillId): ActionView[] {
  return Object.values(ACTIONS)
    .filter((a) => a.skillId === skillId)
    .map((a) => ({
      id: a.id,
      skillId: a.skillId,
      name: a.name,
      description: a.description,
      levelRequired: a.levelRequired,
      durationMs: a.durationMs,
      xpReward: a.xpReward,
      goldReward: a.goldReward,
      drops: a.drops.map((d) => ({
        ...d,
        name: ITEMS[d.itemId]?.name ?? d.itemId,
      })),
    }))
    .sort((a, b) => a.levelRequired - b.levelRequired);
}

export function getXpToLevel(xp: bigint): number {
  return levelForXp(xp);
}
