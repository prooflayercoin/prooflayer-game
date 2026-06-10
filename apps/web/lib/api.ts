import type { CharacterView, GameConfig } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new Error(`API ${res.status} ${path}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getState: () => req<{ character: CharacterView }>("/api/state"),
  getConfig: () => req<GameConfig>("/api/config"),
  startAction: (actionId: string) =>
    req<{ character: CharacterView }>("/api/action/start", {
      method: "POST",
      body: JSON.stringify({ actionId }),
    }),
  stopAction: () =>
    req<{ character: CharacterView }>("/api/action/stop", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  equip: (slot: string, itemId: string) =>
    req<{ character: CharacterView }>("/api/equipment/equip", {
      method: "POST",
      body: JSON.stringify({ slot, itemId }),
    }),
  unequip: (slot: string) =>
    req<{ character: CharacterView }>("/api/equipment/unequip", {
      method: "POST",
      body: JSON.stringify({ slot }),
    }),
};
