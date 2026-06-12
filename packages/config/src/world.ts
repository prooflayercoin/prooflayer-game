import {
  MMO_TICK_MS,
  WORLD_CHUNK_SIZE,
  type RegionId,
  type WorldId,
  type WorldPosition,
} from "@prooflayer/shared";
import { MARKET_CROSS_SHOWCASE_MAP } from "./maps/market-cross-showcase";

export interface WorldShardConfig {
  id: WorldId;
  name: string;
  recommended: boolean;
  capacity: number;
  tickMs: number;
}

export interface TiledIsoLayer {
  id: number;
  name: string;
  type: "tilelayer" | "objectgroup";
  width?: number;
  height?: number;
  data?: number[];
  objects?: Array<{
    id: number;
    name: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    properties?: Array<{ name: string; type: string; value: string | number | boolean }>;
  }>;
}

export interface TiledIsoMap {
  type: "map";
  orientation: "isometric";
  renderorder: "right-down";
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  infinite: false;
  layers: TiledIsoLayer[];
}

export interface PortalConfig {
  id: string;
  name: string;
  position: WorldPosition;
  target: WorldPosition;
}

export interface NpcSpawnConfig {
  id: string;
  name: string;
  position: WorldPosition;
  level: number;
  hostile: boolean;
  hp: number;
}

export interface ResourceNodeConfig {
  id: string;
  name: string;
  position: WorldPosition;
  actionId: string;
  skillId: string;
}

export interface ServiceConfig {
  id: string;
  name: string;
  kind: "bank" | "shop";
  position: WorldPosition;
}

export interface RegionConfig {
  id: RegionId;
  name: string;
  width: number;
  height: number;
  spawn: WorldPosition;
  blocked: Array<{ x: number; y: number }>;
  portals: PortalConfig[];
  npcs: NpcSpawnConfig[];
  resources: ResourceNodeConfig[];
  services: ServiceConfig[];
  map: TiledIsoMap;
}

const TILE = {
  grass: 1,
  dirt: 2,
  water: 3,
  stone: 4,
  floor: 5,
};

const objectScale = 50;

function position(regionId: RegionId, x: number, y: number): WorldPosition {
  return { regionId, x, y };
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function uniqBlocked(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  const seen = new Set<string>();
  const result: Array<{ x: number; y: number }> = [];
  for (const point of points) {
    const pointKey = key(point.x, point.y);
    if (seen.has(pointKey)) continue;
    seen.add(pointKey);
    result.push(point);
  }
  return result;
}

function rect(x1: number, y1: number, width: number, height: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let x = x1; x < x1 + width; x += 1) {
    for (let y = y1; y < y1 + height; y += 1) {
      points.push({ x, y });
    }
  }
  return points;
}

function border(width: number, height: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let x = 0; x < width; x += 1) {
    points.push({ x, y: 0 }, { x, y: height - 1 });
  }
  for (let y = 0; y < height; y += 1) {
    points.push({ x: 0, y }, { x: width - 1, y });
  }
  return points;
}

function makeMap(
  name: string,
  width: number,
  height: number,
  terrainAt: (x: number, y: number) => number,
  blocked: Array<{ x: number; y: number }>
): TiledIsoMap {
  const data: number[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data.push(terrainAt(x, y));
    }
  }

  return {
    type: "map",
    orientation: "isometric",
    renderorder: "right-down",
    width,
    height,
    tilewidth: 100,
    tileheight: 50,
    infinite: false,
    layers: [
      {
        id: 1,
        name: "Terrain",
        type: "tilelayer",
        width,
        height,
        data,
      },
      {
        id: 2,
        name: "Collision",
        type: "objectgroup",
        objects: blocked.map((point, index) => ({
          id: index + 1,
          name: `${name}-blocked-${point.x}-${point.y}`,
          type: "blocked",
          x: point.x * objectScale,
          y: point.y * objectScale,
          width: objectScale,
          height: objectScale,
        })),
      },
    ],
  };
}

function cloneTiledMap(source: TiledIsoMap): TiledIsoMap {
  return {
    ...source,
    layers: source.layers.map((layer) => ({
      ...layer,
      data: layer.data ? [...layer.data] : undefined,
      objects: layer.objects?.map((object) => ({
        ...object,
        properties: object.properties?.map((property) => ({ ...property })),
      })),
    })),
  };
}

function blockedFromCollisionLayer(map: TiledIsoMap): Array<{ x: number; y: number }> {
  const collisionLayer = map.layers.find(
    (layer) => layer.type === "objectgroup" && layer.name === "Collision"
  );
  return uniqBlocked(
    (collisionLayer?.objects ?? [])
      .filter((object) => object.type === "blocked")
      .map((object) => ({
        x: Math.round(object.x / objectScale),
        y: Math.round(object.y / objectScale),
      }))
  );
}

function marketCross(): RegionConfig {
  const id: RegionId = "market_cross";
  const map = cloneTiledMap(MARKET_CROSS_SHOWCASE_MAP as unknown as TiledIsoMap);
  const blocked = blockedFromCollisionLayer(map);

  return {
    id,
    name: "Market Cross",
    width: map.width,
    height: map.height,
    spawn: position(id, 32, 32),
    blocked,
    portals: [
      {
        id: "market-to-grove",
        name: "West Aether Road",
        position: position(id, 2, 31),
        target: position("west_aether_grove", 60, 31),
      },
      {
        id: "market-to-quarry",
        name: "Eastern Quarry Road",
        position: position(id, 61, 32),
        target: position("eastern_quarry", 3, 32),
      },
      {
        id: "market-hall-door",
        name: "Market Hall Door",
        position: position(id, 32, 25),
        target: position("market_hall_interior", 10, 13),
      },
    ],
    npcs: [
      { id: "warden-vale", name: "Warden Vale", position: position(id, 30, 34), level: 1, hostile: false, hp: 10 },
      { id: "trader-mara", name: "Trader Mara", position: position(id, 36, 34), level: 1, hostile: false, hp: 10 },
    ],
    resources: [
      { id: "market-stalks", name: "Aether Stalks", position: position(id, 19, 31), actionId: "reaping.cut_stalks", skillId: "reaping" },
      { id: "market-dim-vein", name: "Dim Shard Vein", position: position(id, 45, 32), actionId: "quarrying.dim_shards", skillId: "quarrying" },
    ],
    services: [
      { id: "market-bank", name: "Market Bank", kind: "bank", position: position(id, 28, 34) },
      { id: "market-shop", name: "Mara's Supply Stall", kind: "shop", position: position(id, 38, 34) },
    ],
    map,
  };
}

function westAetherGrove(): RegionConfig {
  const id: RegionId = "west_aether_grove";
  const thickets = [
    ...rect(8, 8, 10, 12),
    ...rect(20, 42, 14, 10),
    ...rect(40, 9, 9, 13),
    ...rect(45, 45, 9, 9),
  ];
  const blocked = uniqBlocked([...border(64, 64), ...thickets]);

  return {
    id,
    name: "West Aether Grove",
    width: 64,
    height: 64,
    spawn: position(id, 58, 31),
    blocked,
    portals: [
      {
        id: "grove-to-market",
        name: "Market Road",
        position: position(id, 61, 31),
        target: position("market_cross", 3, 31),
      },
    ],
    npcs: [
      { id: "grove-ranger-lio", name: "Ranger Lio", position: position(id, 44, 32), level: 3, hostile: false, hp: 12 },
    ],
    resources: [
      { id: "grove-stalks-a", name: "Aether Stalks", position: position(id, 35, 28), actionId: "reaping.cut_stalks", skillId: "reaping" },
      { id: "grove-stalks-b", name: "Aether Stalks", position: position(id, 31, 34), actionId: "reaping.cut_stalks", skillId: "reaping" },
      { id: "grove-blooms-a", name: "Dawn Blooms", position: position(id, 24, 29), actionId: "reaping.pluck_blooms", skillId: "reaping" },
    ],
    services: [],
    map: makeMap(
      "west-aether-grove",
      64,
      64,
      (x, y) => {
        if (Math.abs(y - 31) <= 2 && x > 34) return TILE.dirt;
        if ((x + y) % 13 === 0) return TILE.dirt;
        return TILE.grass;
      },
      blocked
    ),
  };
}

function easternQuarry(): RegionConfig {
  const id: RegionId = "eastern_quarry";
  const quarryWalls = [
    ...rect(39, 6, 17, 16),
    ...rect(30, 45, 24, 10),
    ...rect(14, 14, 8, 8),
  ];
  const blocked = uniqBlocked([...border(64, 64), ...quarryWalls]);

  return {
    id,
    name: "Eastern Quarry",
    width: 64,
    height: 64,
    spawn: position(id, 4, 32),
    blocked,
    portals: [
      {
        id: "quarry-to-market",
        name: "Market Road",
        position: position(id, 2, 32),
        target: position("market_cross", 60, 32),
      },
    ],
    npcs: [
      { id: "rubble-imp-a", name: "Rubble Imp", position: position(id, 33, 31), level: 4, hostile: true, hp: 14 },
      { id: "quarry-foreman", name: "Foreman Orren", position: position(id, 19, 36), level: 2, hostile: false, hp: 10 },
    ],
    resources: [
      { id: "quarry-dim-vein-a", name: "Dim Shard Vein", position: position(id, 29, 28), actionId: "quarrying.dim_shards", skillId: "quarrying" },
      { id: "quarry-dim-vein-b", name: "Dim Shard Vein", position: position(id, 36, 35), actionId: "quarrying.dim_shards", skillId: "quarrying" },
      { id: "quarry-radiant-vein-a", name: "Radiant Shard Vein", position: position(id, 44, 38), actionId: "quarrying.radiant_shards", skillId: "quarrying" },
    ],
    services: [],
    map: makeMap(
      "eastern-quarry",
      64,
      64,
      (x, y) => {
        if (x > 21 && y > 18 && x < 55 && y < 50) return TILE.stone;
        if (Math.abs(y - 32) <= 2 && x < 24) return TILE.dirt;
        return TILE.grass;
      },
      blocked
    ),
  };
}

function marketHallInterior(): RegionConfig {
  const id: RegionId = "market_hall_interior";
  const walls = uniqBlocked([
    ...border(20, 16),
    ...rect(2, 2, 4, 2),
    ...rect(14, 2, 4, 2),
    ...rect(2, 10, 5, 3),
    ...rect(13, 10, 5, 3),
  ]);

  return {
    id,
    name: "Market Hall",
    width: 20,
    height: 16,
    spawn: position(id, 10, 13),
    blocked: walls,
    portals: [
      {
        id: "market-hall-exit",
        name: "Exit to Market Cross",
        position: position(id, 10, 14),
        target: position("market_cross", 32, 26),
      },
    ],
    npcs: [
      { id: "banker-sella", name: "Banker Sella", position: position(id, 7, 7), level: 1, hostile: false, hp: 10 },
    ],
    resources: [],
    services: [
      { id: "hall-bank", name: "Market Hall Bank", kind: "bank", position: position(id, 8, 7) },
      { id: "hall-shop", name: "Market Ledger", kind: "shop", position: position(id, 12, 7) },
    ],
    map: makeMap("market-hall", 20, 16, () => TILE.floor, walls),
  };
}

export const WORLD_SHARDS: WorldShardConfig[] = [
  {
    id: "world-1",
    name: "World 1 - East",
    recommended: true,
    capacity: 2000,
    tickMs: MMO_TICK_MS,
  },
];

export const WORLD_REGIONS: Record<RegionId, RegionConfig> = {
  market_cross: marketCross(),
  west_aether_grove: westAetherGrove(),
  eastern_quarry: easternQuarry(),
  market_hall_interior: marketHallInterior(),
};

export const REGION_LIST = Object.values(WORLD_REGIONS);

export function getRegionConfig(regionId: RegionId): RegionConfig {
  return WORLD_REGIONS[regionId];
}

export function isKnownWorld(worldId: string): worldId is WorldId {
  return WORLD_SHARDS.some((world) => world.id === worldId);
}
