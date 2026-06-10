import { mulberry32 } from "./rng.js";
import type {
  ActionConfig,
  CharacterState,
  TickEvent,
  TickResult,
} from "./types.js";

export interface TickOptions {
  actions: Record<string, ActionConfig>;
  offlineCapMs: number;
  rng?: () => number;
}

export function tick(
  state: CharacterState,
  now: Date,
  options: TickOptions
): TickResult {
  const events: TickEvent[] = [];
  const nowMs = now.getTime();
  const lastMs = state.lastTickAt.getTime();
  let elapsedMs = nowMs - lastMs;

  if (elapsedMs <= 0) {
    return { state: { ...state, lastTickAt: now }, events };
  }

  if (elapsedMs > options.offlineCapMs) {
    events.push({
      kind: "offline_capped",
      cappedMs: options.offlineCapMs,
      actualMs: elapsedMs,
    });
    elapsedMs = options.offlineCapMs;
  }

  let next: CharacterState = { ...state, lastTickAt: now };

  if (next.activeActionId === null) {
    return { state: next, events };
  }

  const action = options.actions[next.activeActionId];
  if (!action) {
    events.push({
      kind: "action_cleared_invalid",
      actionId: next.activeActionId,
    });
    next = { ...next, activeActionId: null, activeProgressMs: 0 };
    return { state: next, events };
  }

  const totalProgress = next.activeProgressMs + elapsedMs;
  const completions = Math.floor(totalProgress / action.durationMs);
  const leftover = totalProgress - completions * action.durationMs;

  if (completions === 0) {
    next = { ...next, activeProgressMs: leftover };
    return { state: next, events };
  }

  const rng = options.rng ?? mulberry32(next.rngSeed);

  const xpGained = completions * action.xpReward;
  const goldGained = completions * action.goldReward;

  const skill = next.skills[action.skillId];
  next = {
    ...next,
    activeProgressMs: leftover,
    gold: next.gold + BigInt(goldGained),
    skills: {
      ...next.skills,
      [action.skillId]: { xp: skill.xp + BigInt(xpGained) },
    },
  };

  const dropAggregate: Record<string, number> = {};
  for (let i = 0; i < completions; i++) {
    for (const drop of action.drops) {
      if (rng() < drop.chance) {
        const range = drop.max - drop.min + 1;
        const qty = drop.min + Math.floor(rng() * range);
        dropAggregate[drop.itemId] = (dropAggregate[drop.itemId] ?? 0) + qty;
      } else {
        rng();
      }
    }
  }

  if (Object.keys(dropAggregate).length > 0) {
    const newInventory = { ...next.inventory };
    for (const [itemId, qty] of Object.entries(dropAggregate)) {
      newInventory[itemId] = (newInventory[itemId] ?? 0n) + BigInt(qty);
    }
    next = { ...next, inventory: newInventory };
  }

  next = { ...next, rngSeed: (next.rngSeed + completions * 7919) >>> 0 };

  events.push({
    kind: "action_completed",
    actionId: action.id,
    completions,
    xpGained,
    goldGained,
    drops: Object.entries(dropAggregate).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    })),
  });

  return { state: next, events };
}
