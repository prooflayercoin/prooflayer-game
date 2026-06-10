import { ACTIONS } from "@prooflayer/config";
import {
  EQUIPMENT_SLOTS,
  SKILL_IDS,
  tick,
  type CharacterState,
  type EquipmentSlot,
  type SkillId,
  type TickEvent,
} from "@prooflayer/shared";
import { prisma } from "./db.js";
import { OFFLINE_CAP_MS } from "./env.js";

type DbCharacter = Awaited<ReturnType<typeof loadDbCharacter>>;

async function loadDbCharacter(characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { skills: true, inventory: true, equipment: true },
  });
  if (!character) throw new CharacterNotFoundError(characterId);
  return character;
}

export class CharacterNotFoundError extends Error {
  constructor(public characterId: string) {
    super(`Character ${characterId} not found`);
  }
}

export class ActionNotFoundError extends Error {
  constructor(public actionId: string) {
    super(`Action ${actionId} not found`);
  }
}

export class LevelRequirementError extends Error {
  constructor(public required: number, public actual: number) {
    super(`Action requires level ${required}; current level is ${actual}`);
  }
}

function dbToState(db: NonNullable<DbCharacter>): CharacterState {
  const skills = SKILL_IDS.reduce(
    (acc: Record<SkillId, { xp: bigint }>, id: SkillId) => {
      const row = db.skills.find((s: any) => s.skillId === id);
      acc[id] = { xp: row?.xp ?? 0n };
      return acc;
    },
    {} as Record<SkillId, { xp: bigint }>
  );

  const equipment = EQUIPMENT_SLOTS.reduce(
    (acc: Record<EquipmentSlot, string | null>, slot: EquipmentSlot) => {
      const row = db.equipment.find((e: any) => e.slot === slot);
      acc[slot] = row?.itemId ?? null;
      return acc;
    },
    {} as Record<EquipmentSlot, string | null>
  );

  const inventory: Record<string, bigint> = {};
  for (const stack of db.inventory) {
    inventory[stack.itemId] = stack.quantity;
  }

  return {
    id: db.id,
    name: db.name,
    gold: db.gold,
    lastTickAt: db.lastTickAt,
    activeActionId: db.activeActionId,
    activeProgressMs: db.activeProgressMs,
    rngSeed: db.rngSeed,
    skills,
    inventory,
    equipment,
  };
}

async function persistState(
  state: CharacterState,
  events: TickEvent[]
): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    await tx.character.update({
      where: { id: state.id },
      data: {
        gold: state.gold,
        lastTickAt: state.lastTickAt,
        activeActionId: state.activeActionId,
        activeProgressMs: state.activeProgressMs,
        rngSeed: state.rngSeed,
      },
    });

    for (const skillId of SKILL_IDS) {
      const xp = state.skills[skillId].xp;
      await tx.skillProgress.upsert({
        where: { characterId_skillId: { characterId: state.id, skillId } },
        create: { characterId: state.id, skillId, xp },
        update: { xp },
      });
    }

    for (const [itemId, quantity] of Object.entries(state.inventory)) {
      await tx.inventoryStack.upsert({
        where: { characterId_itemId: { characterId: state.id, itemId } },
        create: { characterId: state.id, itemId, quantity },
        update: { quantity },
      });
    }

    for (const slot of EQUIPMENT_SLOTS) {
      const itemId = state.equipment[slot];
      await tx.equipmentSlot.upsert({
        where: { characterId_slot: { characterId: state.id, slot } },
        create: { characterId: state.id, slot, itemId },
        update: { itemId },
      });
    }

    if (events.length > 0) {
      await tx.auditEvent.createMany({
        data: events.map((e) => ({
          characterId: state.id,
          kind: e.kind,
          payload: e as unknown as object,
        })),
      });
    }
  });
}

export async function tickAndPersist(
  characterId: string,
  now: Date = new Date()
): Promise<{ state: CharacterState; events: TickEvent[] }> {
  const dbChar = await loadDbCharacter(characterId);
  const before = dbToState(dbChar);
  const result = tick(before, now, {
    actions: ACTIONS,
    offlineCapMs: OFFLINE_CAP_MS,
  });

  const stateChanged =
    result.events.length > 0 ||
    result.state.lastTickAt.getTime() !== before.lastTickAt.getTime() ||
    result.state.activeProgressMs !== before.activeProgressMs;

  if (stateChanged) {
    await persistState(result.state, result.events);
  }

  return result;
}

export async function startAction(
  characterId: string,
  actionId: string
): Promise<CharacterState> {
  const action = ACTIONS[actionId];
  if (!action) throw new ActionNotFoundError(actionId);

  const { state: tickedState } = await tickAndPersist(characterId);

  const { levelForXp } = await import("@prooflayer/shared");
  const currentLevel = levelForXp(tickedState.skills[action.skillId].xp);
  if (currentLevel < action.levelRequired) {
    throw new LevelRequirementError(action.levelRequired, currentLevel);
  }

  await prisma.character.update({
    where: { id: characterId },
    data: {
      activeActionId: actionId,
      activeProgressMs: 0,
      lastTickAt: new Date(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      characterId,
      kind: "action_started",
      payload: { actionId },
    },
  });

  const final = await loadDbCharacter(characterId);
  return dbToState(final);
}

export async function stopAction(characterId: string): Promise<CharacterState> {
  const { state: tickedState } = await tickAndPersist(characterId);

  await prisma.character.update({
    where: { id: characterId },
    data: {
      activeActionId: null,
      activeProgressMs: 0,
      lastTickAt: new Date(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      characterId,
      kind: "action_stopped",
      payload: { previousActionId: tickedState.activeActionId },
    },
  });

  const final = await loadDbCharacter(characterId);
  return dbToState(final);
}

export async function loadCharacterState(
  characterId: string
): Promise<CharacterState> {
  const dbChar = await loadDbCharacter(characterId);
  return dbToState(dbChar);
}
