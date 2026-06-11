import type { InteractionKind } from "./types";

export const MAP_SIZE = 20;
export const TILE_WIDTH = 100;
export const TILE_HEIGHT = 50;

export interface WorldObjectData {
  id: string;
  texture: string;
  x: number;
  y: number;
  scale?: number;
  yOffset?: number;
  label?: string;
  detail?: string;
  actionId?: string;
  skillId?: string;
  kind?: InteractionKind;
  interactOffset?: { x: number; y: number };
}

export interface NpcData {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  direction: number;
  quest?: boolean;
}

export const BUILDINGS: WorldObjectData[] = [
  {
    id: "market-hall",
    texture: "building-market",
    x: 9,
    y: 9,
    scale: 1.35,
    label: "Market Hall",
    detail: "Traders buy supplies for ordinary gold.",
    kind: "npc",
  },
  {
    id: "proof-guild",
    texture: "building-guild",
    x: 6,
    y: 11,
    scale: 1.35,
    label: "Prooflayer Guild",
    detail: "Training, contracts, and collection records.",
    kind: "npc",
  },
  {
    id: "ember-forge",
    texture: "building-forge",
    x: 13,
    y: 10,
    scale: 1.35,
    label: "Ember Forge",
    detail: "Press gathered shards into useful materials.",
    actionId: "tempering.dim_ingot",
    skillId: "tempering",
    kind: "forge",
    interactOffset: { x: -1, y: 1 },
  },
  {
    id: "sealers-chapel",
    texture: "building-chapel",
    x: 11,
    y: 14,
    scale: 1.35,
    label: "Sealers' Chapel",
    detail: "A quiet refuge at the edge of the wilds.",
    kind: "npc",
  },
];

export const RESOURCE_NODES: WorldObjectData[] = [
  {
    id: "aetherwood-1",
    texture: "tree-tall",
    x: 4,
    y: 6,
    scale: 2.2,
    yOffset: -10,
    label: "Cut aether stalks",
    detail: "Reaping · Level 1 · 10 XP",
    actionId: "reaping.cut_stalks",
    skillId: "reaping",
    kind: "gather",
    interactOffset: { x: 1, y: 0 },
  },
  {
    id: "aetherwood-2",
    texture: "tree-alt-tall",
    x: 3,
    y: 7,
    scale: 2.05,
    yOffset: -8,
    label: "Cut aether stalks",
    detail: "Reaping · Level 1 · 10 XP",
    actionId: "reaping.cut_stalks",
    skillId: "reaping",
    kind: "gather",
    interactOffset: { x: 1, y: 0 },
  },
  {
    id: "dim-vein-1",
    texture: "shard-rock",
    x: 15,
    y: 5,
    scale: 0.42,
    yOffset: 3,
    label: "Chip dim shards",
    detail: "Quarrying · Level 1 · 12 XP",
    actionId: "quarrying.dim_shards",
    skillId: "quarrying",
    kind: "mine",
    interactOffset: { x: -1, y: 1 },
  },
  {
    id: "dim-vein-2",
    texture: "shard-rock",
    x: 16,
    y: 6,
    scale: 0.36,
    yOffset: 3,
    label: "Chip dim shards",
    detail: "Quarrying · Level 1 · 12 XP",
    actionId: "quarrying.dim_shards",
    skillId: "quarrying",
    kind: "mine",
    interactOffset: { x: -1, y: 1 },
  },
];

export const DECORATIONS: WorldObjectData[] = [
  { id: "tree-a", texture: "tree-tall", x: 2, y: 4, scale: 1.9, yOffset: -8 },
  { id: "tree-b", texture: "tree-alt-short", x: 5, y: 4, scale: 2.2, yOffset: -7 },
  { id: "tree-c", texture: "conifer-tall", x: 2, y: 9, scale: 1.75, yOffset: -8 },
  { id: "tree-d", texture: "tree-short", x: 5, y: 7, scale: 2.2, yOffset: -6 },
  { id: "tree-e", texture: "conifer-short", x: 1, y: 12, scale: 2.1, yOffset: -7 },
  { id: "tree-f", texture: "tree-tall", x: 17, y: 3, scale: 2, yOffset: -8 },
  { id: "tree-g", texture: "tree-alt-tall", x: 18, y: 8, scale: 1.9, yOffset: -8 },
  { id: "tree-h", texture: "conifer-tall", x: 16, y: 15, scale: 1.8, yOffset: -8 },
  { id: "tree-i", texture: "tree-short", x: 3, y: 15, scale: 2.2, yOffset: -6 },
  { id: "tree-j", texture: "tree-alt-short", x: 7, y: 16, scale: 2.1, yOffset: -6 },
  { id: "barrel-a", texture: "barrel", x: 8, y: 10, scale: 0.28, yOffset: 0 },
  { id: "crate-a", texture: "crate", x: 10, y: 9, scale: 0.28, yOffset: 0 },
  { id: "crate-b", texture: "crate", x: 12, y: 11, scale: 0.25, yOffset: 0 },
  { id: "chest-a", texture: "chest", x: 7, y: 12, scale: 0.26, yOffset: 0 },
];

export const NPCS: NpcData[] = [
  {
    id: "warden-vale",
    name: "Warden Vale",
    subtitle: "First Tools",
    x: 8,
    y: 8,
    direction: 3,
    quest: true,
  },
  {
    id: "trader-mara",
    name: "Mara",
    subtitle: "Market Trader",
    x: 10,
    y: 10,
    direction: 5,
  },
  {
    id: "smith-orren",
    name: "Orren",
    subtitle: "Temperer",
    x: 13,
    y: 9,
    direction: 4,
  },
];

export function isPathTile(x: number, y: number): boolean {
  const marketCross = x >= 7 && x <= 12 && y >= 7 && y <= 12;
  const northRoad = x === 9 || x === 10;
  const eastRoad = y === 9 || y === 10;
  const resourceTrail = x + y >= 18 && x + y <= 20;
  return marketCross || northRoad || eastRoad || resourceTrail;
}
