export const MMO_TICK_MS = 600;
export const WORLD_CHUNK_SIZE = 16;

export type WorldId = `world-${number}`;
export type RegionId =
  | "market_cross"
  | "west_aether_grove"
  | "eastern_quarry"
  | "market_hall_interior";

export interface WorldPosition {
  regionId: RegionId;
  x: number;
  y: number;
}

export interface MovementPath {
  from: WorldPosition;
  to: WorldPosition;
  steps: WorldPosition[];
  startedAt: number;
  endsAt: number;
}

export type EntityKind =
  | "player"
  | "npc"
  | "resource"
  | "bank"
  | "shop"
  | "portal";

export interface BaseEntitySnapshot {
  id: string;
  kind: EntityKind;
  name: string;
  position: WorldPosition;
}

export interface PlayerSnapshot extends BaseEntitySnapshot {
  kind: "player";
  characterId: string;
  totalLevel: number;
  path?: MovementPath;
}

export interface NpcSnapshot extends BaseEntitySnapshot {
  kind: "npc";
  npcId: string;
  hostile: boolean;
  level: number;
  hp: number;
  maxHp: number;
}

export interface ResourceSnapshot extends BaseEntitySnapshot {
  kind: "resource";
  actionId: string;
  skillId: string;
}

export interface ServiceEntitySnapshot extends BaseEntitySnapshot {
  kind: "bank" | "shop" | "portal";
  targetRegionId?: RegionId;
}

export type EntitySnapshot =
  | PlayerSnapshot
  | NpcSnapshot
  | ResourceSnapshot
  | ServiceEntitySnapshot;

export interface RegionSnapshot {
  regionId: RegionId;
  width: number;
  height: number;
  chunkSize: number;
  terrain: number[];
  entities: EntitySnapshot[];
  blocked: Array<{ x: number; y: number }>;
}

export type WorldClientMessage =
  | { type: "join_world"; worldId: WorldId; characterId: string }
  | { type: "move_to"; requestId: string; to: WorldPosition }
  | { type: "interact_entity"; requestId: string; entityId: string }
  | { type: "attack_entity"; requestId: string; entityId: string }
  | { type: "chat_local"; requestId: string; text: string }
  | { type: "logout" };

export type WorldServerMessage =
  | {
      type: "joined";
      worldId: WorldId;
      characterId: string;
      player: PlayerSnapshot;
      tickMs: number;
      serverTime: number;
    }
  | { type: "region_snapshot"; snapshot: RegionSnapshot; serverTime: number }
  | {
      type: "player_delta";
      players: PlayerSnapshot[];
      removedPlayerIds: string[];
      serverTime: number;
    }
  | {
      type: "entity_delta";
      entities: EntitySnapshot[];
      removedEntityIds: string[];
      serverTime: number;
    }
  | {
      type: "combat_event";
      attackerId: string;
      targetId: string;
      damage: number;
      serverTime: number;
    }
  | {
      type: "inventory_delta";
      itemId: string;
      quantity: string;
      serverTime: number;
    }
  | {
      type: "chat_message";
      fromCharacterId: string;
      fromName: string;
      text: string;
      serverTime: number;
    }
  | { type: "error"; code: string; message: string; requestId?: string };
