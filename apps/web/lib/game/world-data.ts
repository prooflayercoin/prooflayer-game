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
    scale: 0.49,
    yOffset: -3,
    label: "Market Hall",
    detail: "Traders buy supplies for ordinary gold.",
    kind: "npc",
  },
  {
    id: "proof-guild",
    texture: "building-guild",
    x: 6,
    y: 11,
    scale: 0.49,
    yOffset: -3,
    label: "Prooflayer Guild",
    detail: "Training, contracts, and collection records.",
    kind: "npc",
  },
  {
    id: "ember-forge",
    texture: "building-forge",
    x: 13,
    y: 10,
    scale: 0.47,
    yOffset: -2,
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
    scale: 0.49,
    yOffset: -3,
    label: "Sealers' Chapel",
    detail: "A quiet refuge at the edge of the wilds.",
    kind: "npc",
  },
];

export const RESOURCE_NODES: WorldObjectData[] = [
  {
    id: "aetherwood-1",
    texture: "nature-aether-stalk",
    x: 4,
    y: 6,
    scale: 0.62,
    yOffset: 0,
    label: "Cut aether stalks",
    detail: "Reaping · Level 1 · 10 XP",
    actionId: "reaping.cut_stalks",
    skillId: "reaping",
    kind: "gather",
    interactOffset: { x: 1, y: 0 },
  },
  {
    id: "aetherwood-2",
    texture: "nature-aether-stalk",
    x: 3,
    y: 7,
    scale: 0.56,
    yOffset: 0,
    label: "Cut aether stalks",
    detail: "Reaping · Level 1 · 10 XP",
    actionId: "reaping.cut_stalks",
    skillId: "reaping",
    kind: "gather",
    interactOffset: { x: 1, y: 0 },
  },
  {
    id: "dim-vein-1",
    texture: "mine-ore-rocks",
    x: 12,
    y: 7,
    scale: 0.34,
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
    texture: "mine-rock-b",
    x: 13,
    y: 7,
    scale: 0.3,
    yOffset: 3,
    label: "Chip dim shards",
    detail: "Quarrying · Level 1 · 12 XP",
    actionId: "quarrying.dim_shards",
    skillId: "quarrying",
    kind: "mine",
    interactOffset: { x: -1, y: 1 },
  },
  {
    id: "foreshade-trail-1",
    texture: "prop-chest",
    x: 5,
    y: 14,
    scale: 0.48,
    yOffset: 0,
    label: "Track foreshades",
    detail: "Tracking · Level 1 · 14 XP",
    actionId: "tracking.foreshades",
    skillId: "tracking",
    kind: "track",
    interactOffset: { x: 1, y: -1 },
  },
  {
    id: "tonic-station-1",
    texture: "prop-potion-red",
    x: 12,
    y: 12,
    scale: 0.5,
    yOffset: 0,
    label: "Brew minor tonic",
    detail: "Distilling · Level 1 · 16 XP",
    actionId: "distilling.minor_tonic",
    skillId: "distilling",
    kind: "distill",
    interactOffset: { x: -1, y: 0 },
  },
  {
    id: "dim-wisp-rift-1",
    texture: "shard-rock",
    x: 11,
    y: 15,
    scale: 0.34,
    yOffset: 3,
    label: "Banish dim wisps",
    detail: "Sealing · Level 1 · 18 XP",
    actionId: "sealing.dim_wisps",
    skillId: "sealing",
    kind: "seal",
    interactOffset: { x: -1, y: -1 },
  },
];

export const DECORATIONS: WorldObjectData[] = [
  { id: "north-workshop", texture: "building-cottage", x: 8, y: 5, scale: 0.36, yOffset: -5 },
  { id: "north-storehouse", texture: "building-guild", x: 10, y: 4, scale: 0.35, yOffset: -4 },
  { id: "tree-a", texture: "tree-common-a", x: 2, y: 4, scale: 0.56, yOffset: -5 },
  { id: "tree-b", texture: "tree-common-b", x: 5, y: 4, scale: 0.52, yOffset: -5 },
  { id: "tree-north-a", texture: "tree-pine-a", x: 7, y: 3, scale: 0.56, yOffset: -5 },
  { id: "tree-north-b", texture: "tree-common-c", x: 11, y: 3, scale: 0.55, yOffset: -5 },
  { id: "tree-north-c", texture: "tree-pine-b", x: 12, y: 4, scale: 0.52, yOffset: -5 },
  { id: "tree-c", texture: "tree-pine-c", x: 3, y: 8, scale: 0.54, yOffset: -5 },
  { id: "tree-d", texture: "tree-common-b", x: 5, y: 7, scale: 0.5, yOffset: -5 },
  { id: "aether-grove-bloom-a", texture: "nature-dawn-bloom", x: 4, y: 7, scale: 0.28, yOffset: 2 },
  { id: "aether-grove-bloom-b", texture: "nature-starflax", x: 5, y: 6, scale: 0.24, yOffset: 2 },
  { id: "tree-e", texture: "tree-pine-b", x: 4, y: 13, scale: 0.52, yOffset: -5 },
  { id: "tree-f", texture: "tree-common-a", x: 17, y: 3, scale: 0.54, yOffset: -5 },
  { id: "tree-g", texture: "tree-common-c", x: 18, y: 8, scale: 0.52, yOffset: -5 },
  { id: "tree-h", texture: "tree-pine-a", x: 16, y: 15, scale: 0.48, yOffset: -5 },
  { id: "tree-i", texture: "tree-common-b", x: 3, y: 15, scale: 0.5, yOffset: -5 },
  { id: "tree-j", texture: "tree-common-c", x: 7, y: 16, scale: 0.49, yOffset: -5 },
  { id: "tree-k", texture: "tree-pine-c", x: 14, y: 4, scale: 0.53, yOffset: -5 },
  { id: "tree-l", texture: "tree-pine-b", x: 15, y: 4, scale: 0.5, yOffset: -5 },
  { id: "tree-m", texture: "tree-common-a", x: 18, y: 12, scale: 0.52, yOffset: -5 },
  { id: "tree-rift-twisted", texture: "tree-twisted", x: 12, y: 15, scale: 0.48, yOffset: -5 },
  { id: "tree-quarry-dead", texture: "tree-dead", x: 15, y: 6, scale: 0.42, yOffset: -5 },
  { id: "animal-deer-north", texture: "animal-deer", x: 15, y: 3, scale: 0.26, yOffset: 3 },
  { id: "animal-fox-grove", texture: "animal-fox", x: 3, y: 6, scale: 0.24, yOffset: 3 },
  { id: "animal-rabbit-guild", texture: "animal-rabbit", x: 5, y: 13, scale: 0.19, yOffset: 4 },
  { id: "animal-boar-edge", texture: "animal-boar", x: 17, y: 13, scale: 0.28, yOffset: 5 },
  { id: "animal-owl-north", texture: "animal-owl", x: 3, y: 5, scale: 0.17, yOffset: -45 },
  { id: "town-well", texture: "medieval-well", x: 4, y: 10, scale: 0.3, yOffset: 2 },
  { id: "market-bench", texture: "medieval-bench", x: 7, y: 11, scale: 0.25, yOffset: 4 },
  { id: "forge-firewood", texture: "medieval-firewood", x: 14, y: 11, scale: 0.22, yOffset: 4 },
  { id: "guild-haystack", texture: "medieval-haystack", x: 5, y: 13, scale: 0.2, yOffset: 4 },
  { id: "apothecary-pot-a", texture: "medieval-pot-a", x: 12, y: 13, scale: 0.14, yOffset: 4 },
  { id: "apothecary-pot-b", texture: "medieval-pot-b", x: 13, y: 13, scale: 0.14, yOffset: 4 },
  { id: "animal-trough", texture: "medieval-trough", x: 16, y: 12, scale: 0.23, yOffset: 4 },
  { id: "grove-stump", texture: "medieval-stump", x: 4, y: 8, scale: 0.18, yOffset: 4 },
  { id: "river-washboard", texture: "medieval-washboard", x: 3, y: 10, scale: 0.19, yOffset: 3 },
  { id: "river-basin", texture: "medieval-basin", x: 4, y: 9, scale: 0.17, yOffset: 4 },
  { id: "market-broken-barrel", texture: "medieval-barrel-broken", x: 7, y: 10, scale: 0.18, yOffset: 4 },
  { id: "barrel-a", texture: "barrel", x: 8, y: 10, scale: 0.28, yOffset: 0 },
  { id: "crate-a", texture: "crate", x: 10, y: 9, scale: 0.28, yOffset: 0 },
  { id: "crate-b", texture: "crate", x: 12, y: 11, scale: 0.25, yOffset: 0 },
  { id: "chest-a", texture: "prop-chest", x: 7, y: 12, scale: 0.34, yOffset: 0 },
  { id: "sign-guild", texture: "sign-guild", x: 6, y: 10, scale: 0.21, yOffset: -18 },
  { id: "sign-market", texture: "sign-market", x: 8, y: 11, scale: 0.2, yOffset: -10 },
  { id: "sign-forge", texture: "sign-forge", x: 13, y: 9, scale: 0.2, yOffset: -16 },
  { id: "sign-quarry", texture: "sign-quarry", x: 12, y: 6, scale: 0.2, yOffset: -14 },
  { id: "market-table", texture: "table-market", x: 8, y: 11, scale: 0.62, yOffset: 6 },
  { id: "market-stall-main", texture: "prop-market-stall", x: 9, y: 11, scale: 0.48, yOffset: 2 },
  { id: "market-cart-stall", texture: "prop-cart-stall", x: 11, y: 10, scale: 0.46, yOffset: 2 },
  { id: "market-coins", texture: "prop-coins", x: 10, y: 11, scale: 0.28, yOffset: 0 },
  { id: "village-wagon-market", texture: "village-wagon", x: 8, y: 8, scale: 0.38, yOffset: 4 },
  { id: "guild-vine", texture: "village-vine", x: 6, y: 11, scale: 0.3, yOffset: -58 },
  { id: "market-shutters", texture: "village-shutters", x: 9, y: 9, scale: 0.22, yOffset: -46 },
  { id: "barrels-market", texture: "barrels-stack", x: 7, y: 9, scale: 0.52, yOffset: 8 },
  { id: "sacks-market", texture: "sacks-crate", x: 11, y: 8, scale: 0.55, yOffset: 8 },
  { id: "hay-near-guild", texture: "hay-bales", x: 5, y: 12, scale: 0.55, yOffset: 8 },
  { id: "bridge-planks", texture: "planks-w", x: 3, y: 9, scale: 0.78, yOffset: 4 },
  { id: "forge-candle-a", texture: "candle-stand", x: 13, y: 9, scale: 0.45, yOffset: 5 },
  { id: "forge-candle-b", texture: "candle-stand", x: 14, y: 10, scale: 0.4, yOffset: 5 },
  { id: "forge-tools", texture: "prop-pickaxe", x: 13, y: 11, scale: 0.3, yOffset: 0 },
  { id: "guild-banner", texture: "prop-banner-blue", x: 6, y: 10, scale: 0.46, yOffset: -4 },
  { id: "forge-banner", texture: "prop-banner-red", x: 14, y: 9, scale: 0.46, yOffset: -4 },
  { id: "stone-edge-a", texture: "mine-rock-a", x: 12, y: 6, scale: 0.32, yOffset: 5 },
  { id: "stone-edge-b", texture: "mine-rock-b", x: 14, y: 6, scale: 0.28, yOffset: 6 },
  { id: "stone-edge-c", texture: "mine-rock-a", x: 13, y: 8, scale: 0.28, yOffset: 5 },
  { id: "stone-edge-d", texture: "stone-side", x: 9, y: 4, scale: 0.55, yOffset: 7 },
  { id: "stone-edge-e", texture: "stone-w", x: 11, y: 5, scale: 0.5, yOffset: 8 },
  { id: "mine-rail-a", texture: "mine-rail-straight", x: 12, y: 8, scale: 0.3, yOffset: 5 },
  { id: "mine-rail-b", texture: "mine-rail-curve", x: 13, y: 6, scale: 0.28, yOffset: 5 },
  { id: "mine-cart-frame", texture: "mine-cart-frame", x: 14, y: 7, scale: 0.28, yOffset: 5 },
  { id: "mine-bucket-a", texture: "mine-bucket", x: 12, y: 9, scale: 0.24, yOffset: 0 },
  { id: "mine-dynamite-a", texture: "mine-dynamite", x: 15, y: 7, scale: 0.24, yOffset: 0 },
  { id: "fence-a", texture: "village-fence", x: 6, y: 8, scale: 0.35, yOffset: 5 },
  { id: "fence-b", texture: "village-fence", x: 7, y: 7, scale: 0.32, yOffset: 5 },
  { id: "fence-c", texture: "fence-high-n", x: 11, y: 12, scale: 0.5, yOffset: 8 },
  { id: "fence-d", texture: "fence-high-s", x: 12, y: 13, scale: 0.5, yOffset: 8 },
  { id: "fence-e", texture: "fence-broken-n", x: 4, y: 10, scale: 0.5, yOffset: 8 },
  { id: "fence-f", texture: "village-fence", x: 9, y: 6, scale: 0.32, yOffset: 5 },
  { id: "fence-g", texture: "village-fence", x: 10, y: 6, scale: 0.32, yOffset: 5 },
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
