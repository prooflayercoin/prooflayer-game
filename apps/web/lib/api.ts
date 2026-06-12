import type { CharacterView, GameConfig } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_BASE = BASE.replace(/^http/, "ws");

export interface AccountView {
  id: string;
  email: string;
}

export interface CharacterSummaryView {
  id: string;
  name: string;
  worldId: string;
  regionId: string;
  position: { regionId: string; x: number; y: number };
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
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
  wsWorldUrl: (worldId: string) => `${WS_BASE}/ws/world?worldId=${encodeURIComponent(worldId)}`,
  register: (input: { email: string; password: string; characterName?: string }) =>
    req<{ account: AccountView; characters: CharacterSummaryView[] }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    req<{ account: AccountView; characters: CharacterSummaryView[] }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () =>
    req<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  getSession: () =>
    req<{ account: AccountView | null; characters: CharacterSummaryView[] }>("/api/session"),
  getWorlds: () =>
    req<{
      worlds: Array<{ id: string; name: string; recommended: boolean; capacity: number; tickMs: number }>;
      regions: Array<{ id: string; name: string; width: number; height: number }>;
    }>("/api/worlds"),
  getCharacters: () => req<{ characters: CharacterSummaryView[] }>("/api/characters"),
  createCharacter: (name: string) =>
    req<{ character: CharacterSummaryView }>("/api/characters", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
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
