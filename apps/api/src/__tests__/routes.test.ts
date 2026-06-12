import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EQUIPMENT_SLOTS,
  SKILL_IDS,
  type CharacterState,
  type EquipmentSlot,
  type SkillId,
} from "@prooflayer/shared";

const mockState = vi.hoisted(() => {
  const skillIds = [
    "reaping",
    "quarrying",
    "tempering",
    "tracking",
    "distilling",
    "sealing",
  ] as const;
  const equipmentSlots = [
    "head",
    "body",
    "hands",
    "feet",
    "weapon",
    "accessory",
  ] as const;
  const makeState = (): CharacterState => ({
    id: "test-character-01",
    name: "Apprentice",
    gold: 7n,
    worldId: "world-1",
    regionId: "market_cross",
    tileX: 32,
    tileY: 32,
    hp: 10,
    maxHp: 10,
    lastTickAt: new Date("2026-06-11T00:00:00.000Z"),
    activeActionId: null,
    activeProgressMs: 0,
    rngSeed: 1,
    skills: skillIds.reduce(
      (acc, skillId) => ({ ...acc, [skillId]: { xp: 0n } }),
      {} as Record<SkillId, { xp: bigint }>
    ),
    inventory: {
      aether_stalk: 3n,
      apprentice_blade: 1n,
    },
    equipment: equipmentSlots.reduce(
      (acc, slot) => ({ ...acc, [slot]: null }),
      {} as Record<EquipmentSlot, string | null>
    ),
  });

  return {
    base: makeState(),
    started: { ...makeState(), activeActionId: "reaping.cut_stalks" },
  };
});

const characterMocks = vi.hoisted(() => ({
  tickAndPersist: vi.fn(),
  loadCharacterState: vi.fn(),
  startAction: vi.fn(),
  stopAction: vi.fn(),
}));

const equipmentMocks = vi.hoisted(() => ({
  equipItem: vi.fn(),
  unequipSlot: vi.fn(),
}));

vi.mock("../env.js", () => ({
  env: {
    NODE_ENV: "test",
    API_PORT: 4000,
    API_HOST: "127.0.0.1",
    DEV_CHARACTER_ID: "test-character-01",
  },
  OFFLINE_CAP_MS: 12 * 60 * 60 * 1000,
}));

vi.mock("../character.js", () => {
  class CharacterNotFoundError extends Error {}
  class ActionNotFoundError extends Error {}
  class LevelRequirementError extends Error {
    required = 1;
    actual = 1;
  }
  return {
    CharacterNotFoundError,
    ActionNotFoundError,
    LevelRequirementError,
    tickAndPersist: characterMocks.tickAndPersist,
    loadCharacterState: characterMocks.loadCharacterState,
    startAction: characterMocks.startAction,
    stopAction: characterMocks.stopAction,
  };
});

vi.mock("../equipment.js", () => {
  class ItemNotInInventoryError extends Error {}
  class ItemSlotMismatchError extends Error {}
  class SlotEmptyError extends Error {}
  return {
    ItemNotInInventoryError,
    ItemSlotMismatchError,
    SlotEmptyError,
    equipItem: equipmentMocks.equipItem,
    unequipSlot: equipmentMocks.unequipSlot,
  };
});

describe("Prooflayer API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    characterMocks.tickAndPersist.mockResolvedValue({
      state: mockState.base,
      events: [],
    });
    characterMocks.loadCharacterState.mockResolvedValue(mockState.base);
    characterMocks.startAction.mockResolvedValue(mockState.started);
    characterMocks.stopAction.mockResolvedValue(mockState.base);
    equipmentMocks.equipItem.mockResolvedValue(undefined);
    equipmentMocks.unequipSlot.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serves health and game config", async () => {
    const { buildApp } = await import("../app.js");
    const app = await buildApp();

    const health = await app.inject({ method: "GET", url: "/healthz" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ ok: true });

    const config = await app.inject({ method: "GET", url: "/api/config" });
    expect(config.statusCode).toBe(200);
    expect(config.json().skills).toHaveLength(SKILL_IDS.length);

    await app.close();
  });

  it("loads state through the ticking endpoint", async () => {
    const { buildApp } = await import("../app.js");
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/api/state" });

    expect(response.statusCode).toBe(200);
    expect(characterMocks.tickAndPersist).toHaveBeenCalledWith(
      "test-character-01"
    );
    expect(response.json().character.inventory[0]).toMatchObject({
      itemId: "aether_stalk",
      quantity: "3",
    });

    await app.close();
  });

  it("starts and stops actions", async () => {
    const { buildApp } = await import("../app.js");
    const app = await buildApp();

    const start = await app.inject({
      method: "POST",
      url: "/api/action/start",
      payload: { actionId: "reaping.cut_stalks" },
    });
    expect(start.statusCode).toBe(200);
    expect(characterMocks.startAction).toHaveBeenCalledWith(
      "test-character-01",
      "reaping.cut_stalks"
    );
    expect(start.json().character.activeAction.actionId).toBe(
      "reaping.cut_stalks"
    );

    const stop = await app.inject({
      method: "POST",
      url: "/api/action/stop",
    });
    expect(stop.statusCode).toBe(200);
    expect(characterMocks.stopAction).toHaveBeenCalledWith("test-character-01");

    await app.close();
  });

  it("equips and unequips items", async () => {
    const { buildApp } = await import("../app.js");
    const app = await buildApp();

    const equip = await app.inject({
      method: "POST",
      url: "/api/equipment/equip",
      payload: { slot: "weapon", itemId: "apprentice_blade" },
    });
    expect(equip.statusCode).toBe(200);
    expect(equipmentMocks.equipItem).toHaveBeenCalledWith(
      "test-character-01",
      "weapon",
      "apprentice_blade"
    );

    const unequip = await app.inject({
      method: "POST",
      url: "/api/equipment/unequip",
      payload: { slot: "weapon" },
    });
    expect(unequip.statusCode).toBe(200);
    expect(equipmentMocks.unequipSlot).toHaveBeenCalledWith(
      "test-character-01",
      "weapon"
    );

    await app.close();
  });
});
