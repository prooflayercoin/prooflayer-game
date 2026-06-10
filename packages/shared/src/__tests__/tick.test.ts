import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng.js";
import { tick } from "../tick.js";
import type { ActionConfig, CharacterState, SkillId } from "../types.js";
import { EQUIPMENT_SLOTS, SKILL_IDS } from "../types.js";

const baseAction: ActionConfig = {
  id: "reaping.cut_stalks",
  skillId: "reaping",
  name: "Cut stalks",
  description: "",
  levelRequired: 1,
  durationMs: 3000,
  xpReward: 10,
  goldReward: 1,
  drops: [{ itemId: "aether_stalk", min: 1, max: 1, chance: 1 }],
};

const rareAction: ActionConfig = {
  id: "reaping.rare",
  skillId: "reaping",
  name: "Rare",
  description: "",
  levelRequired: 1,
  durationMs: 1000,
  xpReward: 5,
  goldReward: 0,
  drops: [
    { itemId: "common", min: 1, max: 1, chance: 1 },
    { itemId: "rare", min: 1, max: 1, chance: 0.25 },
  ],
};

const actions = {
  [baseAction.id]: baseAction,
  [rareAction.id]: rareAction,
};

function makeState(overrides: Partial<CharacterState> = {}): CharacterState {
  const skills = SKILL_IDS.reduce(
    (acc, s) => ({ ...acc, [s]: { xp: 0n } }),
    {} as Record<SkillId, { xp: bigint }>
  );
  const equipment = EQUIPMENT_SLOTS.reduce(
    (acc, s) => ({ ...acc, [s]: null }),
    {} as Record<(typeof EQUIPMENT_SLOTS)[number], string | null>
  );
  return {
    id: "char-test",
    name: "Test",
    gold: 0n,
    lastTickAt: new Date(0),
    activeActionId: null,
    activeProgressMs: 0,
    rngSeed: 1,
    skills,
    inventory: {},
    equipment,
    ...overrides,
  };
}

const OFFLINE_CAP_MS = 12 * 60 * 60 * 1000;

describe("tick — idle character", () => {
  it("no-op when no active action", () => {
    const s = makeState({ lastTickAt: new Date(0) });
    const { state, events } = tick(s, new Date(60_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(state.lastTickAt.getTime()).toBe(60_000);
    expect(events).toEqual([]);
    expect(state.gold).toBe(0n);
  });

  it("no-op when now <= lastTickAt", () => {
    const s = makeState({ lastTickAt: new Date(60_000) });
    const { state, events } = tick(s, new Date(60_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(events).toEqual([]);
    expect(state.lastTickAt.getTime()).toBe(60_000);
  });
});

describe("tick — active action awarding", () => {
  it("zero completions when elapsed < duration", () => {
    const s = makeState({
      activeActionId: baseAction.id,
      lastTickAt: new Date(0),
    });
    const { state, events } = tick(s, new Date(2_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(events).toEqual([]);
    expect(state.activeProgressMs).toBe(2_000);
    expect(state.skills.reaping.xp).toBe(0n);
  });

  it("one completion at exact duration", () => {
    const s = makeState({
      activeActionId: baseAction.id,
      lastTickAt: new Date(0),
    });
    const { state, events } = tick(s, new Date(3_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(events).toHaveLength(1);
    expect(state.skills.reaping.xp).toBe(10n);
    expect(state.gold).toBe(1n);
    expect(state.inventory["aether_stalk"]).toBe(1n);
    expect(state.activeProgressMs).toBe(0);
  });

  it("accumulates leftover progress across two ticks", () => {
    const s = makeState({
      activeActionId: baseAction.id,
      lastTickAt: new Date(0),
    });
    const r1 = tick(s, new Date(2_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    const r2 = tick(r1.state, new Date(3_500), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(r2.state.skills.reaping.xp).toBe(10n);
    expect(r2.state.activeProgressMs).toBe(500);
  });

  it("awards N completions over N*duration elapsed", () => {
    const s = makeState({
      activeActionId: baseAction.id,
      lastTickAt: new Date(0),
    });
    const { state } = tick(s, new Date(15_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(state.skills.reaping.xp).toBe(50n);
    expect(state.gold).toBe(5n);
    expect(state.inventory["aether_stalk"]).toBe(5n);
  });

  it("clears action and emits event when actionId is unknown", () => {
    const s = makeState({
      activeActionId: "does.not.exist",
      lastTickAt: new Date(0),
    });
    const { state, events } = tick(s, new Date(10_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    expect(state.activeActionId).toBeNull();
    expect(events.some((e) => e.kind === "action_cleared_invalid")).toBe(true);
  });
});

describe("tick — offline cap", () => {
  it("caps catch-up at offlineCapMs and emits offline_capped event", () => {
    const s = makeState({
      activeActionId: baseAction.id,
      lastTickAt: new Date(0),
    });
    const TWO_DAYS = 48 * 60 * 60 * 1000;
    const { state, events } = tick(s, new Date(TWO_DAYS), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
    });
    const capped = events.find((e) => e.kind === "offline_capped");
    expect(capped).toBeDefined();
    const expectedCompletions = Math.floor(OFFLINE_CAP_MS / baseAction.durationMs);
    expect(state.skills.reaping.xp).toBe(BigInt(expectedCompletions * 10));
  });
});

describe("tick — deterministic drops via injected rng", () => {
  it("produces identical drops for identical seeds", () => {
    const s1 = makeState({
      activeActionId: rareAction.id,
      lastTickAt: new Date(0),
    });
    const s2 = makeState({
      activeActionId: rareAction.id,
      lastTickAt: new Date(0),
    });
    const r1 = tick(s1, new Date(20_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
      rng: mulberry32(42),
    });
    const r2 = tick(s2, new Date(20_000), {
      actions,
      offlineCapMs: OFFLINE_CAP_MS,
      rng: mulberry32(42),
    });
    expect(r1.state.inventory).toEqual(r2.state.inventory);
  });
});
