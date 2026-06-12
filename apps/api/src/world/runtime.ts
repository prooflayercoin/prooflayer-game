import {
  getRegionConfig,
  isKnownWorld,
  WORLD_SHARDS,
  type RegionConfig,
} from "@prooflayer/config";
import {
  MMO_TICK_MS,
  SKILL_IDS,
  levelForXp,
  worldClientMessageSchema,
  type EntitySnapshot,
  type PlayerSnapshot,
  type RegionId,
  type RegionSnapshot,
  type WorldClientMessage,
  type WorldId,
  type WorldPosition,
  type WorldServerMessage,
} from "@prooflayer/shared";
import type { WebSocket } from "@fastify/websocket";
import { prisma } from "../db.js";
import { findPath } from "./pathfinding.js";

interface WorldClient {
  socket: WebSocket;
  accountId: string;
  characterId: string;
  worldId: WorldId;
  name: string;
  totalLevel: number;
  position: WorldPosition;
  path?: PlayerSnapshot["path"];
}

function send(socket: WebSocket, message: WorldServerMessage): void {
  if (socket.readyState !== 1) return;
  socket.send(JSON.stringify(message));
}

function entityId(kind: string, id: string): string {
  return `${kind}:${id}`;
}

function totalLevel(skills: Array<{ skillId: string; xp: bigint }>): number {
  return SKILL_IDS.reduce((sum, skillId) => {
    const row = skills.find((skill) => skill.skillId === skillId);
    return sum + levelForXp(row?.xp ?? 0n);
  }, 0);
}

function playerSnapshot(client: WorldClient): PlayerSnapshot {
  return {
    id: entityId("player", client.characterId),
    kind: "player",
    characterId: client.characterId,
    name: client.name,
    totalLevel: client.totalLevel,
    position: client.position,
    path: client.path,
  };
}

function staticEntities(region: RegionConfig): EntitySnapshot[] {
  return [
    ...region.npcs.map((npc) => ({
      id: entityId("npc", npc.id),
      kind: "npc" as const,
      npcId: npc.id,
      name: npc.name,
      position: npc.position,
      hostile: npc.hostile,
      level: npc.level,
      hp: npc.hp,
      maxHp: npc.hp,
    })),
    ...region.resources.map((resource) => ({
      id: entityId("resource", resource.id),
      kind: "resource" as const,
      name: resource.name,
      position: resource.position,
      actionId: resource.actionId,
      skillId: resource.skillId,
    })),
    ...region.services.map((service) => ({
      id: entityId(service.kind, service.id),
      kind: service.kind,
      name: service.name,
      position: service.position,
    })),
    ...region.portals.map((portal) => ({
      id: entityId("portal", portal.id),
      kind: "portal" as const,
      name: portal.name,
      position: portal.position,
      targetRegionId: portal.target.regionId,
    })),
  ];
}

export class WorldRuntime {
  private clients = new Map<string, WorldClient>();
  private tickTimer: NodeJS.Timeout;

  constructor() {
    this.tickTimer = setInterval(() => this.tick(), MMO_TICK_MS);
  }

  close(): void {
    clearInterval(this.tickTimer);
    for (const client of this.clients.values()) {
      client.socket.close();
    }
    this.clients.clear();
  }

  async handleConnection(socket: WebSocket, accountId: string, requestedWorldId: string): Promise<void> {
    if (!isKnownWorld(requestedWorldId)) {
      send(socket, { type: "error", code: "unknown_world", message: "Unknown world" });
      socket.close();
      return;
    }

    socket.on("message", (data: unknown) => {
      void this.handleRawMessage(socket, accountId, requestedWorldId, String(data));
    });
    socket.on("close", () => this.removeSocket(socket));
  }

  private async handleRawMessage(
    socket: WebSocket,
    accountId: string,
    requestedWorldId: string,
    raw: string
  ): Promise<void> {
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      send(socket, { type: "error", code: "bad_json", message: "Invalid JSON message" });
      return;
    }

    const parsed = worldClientMessageSchema.safeParse(payload);
    if (!parsed.success) {
      send(socket, { type: "error", code: "bad_message", message: "Invalid world message" });
      return;
    }

    const message = parsed.data;
    if (message.type === "join_world") {
      await this.join(socket, accountId, requestedWorldId as WorldId, message);
      return;
    }

    const client = this.clientForSocket(socket);
    if (!client) {
      send(socket, { type: "error", code: "not_joined", message: "Join a world before sending intents" });
      return;
    }

    if (message.type === "move_to") {
      await this.move(client, message);
      return;
    }
    if (message.type === "chat_local") {
      this.broadcastRegion(client.worldId, client.position.regionId, {
        type: "chat_message",
        fromCharacterId: client.characterId,
        fromName: client.name,
        text: message.text,
        serverTime: Date.now(),
      });
      return;
    }
    if (message.type === "logout") {
      socket.close();
      return;
    }

    send(socket, {
      type: "error",
      code: "not_implemented",
      message: `${message.type} is reserved for the next MMO gameplay slice`,
      requestId: "requestId" in message ? message.requestId : undefined,
    });
  }

  private async join(
    socket: WebSocket,
    accountId: string,
    requestedWorldId: WorldId,
    message: Extract<WorldClientMessage, { type: "join_world" }>
  ): Promise<void> {
    if (message.worldId !== requestedWorldId) {
      send(socket, { type: "error", code: "world_mismatch", message: "World mismatch" });
      return;
    }

    const character = await prisma.character.findFirst({
      where: { id: message.characterId, accountId },
      include: { skills: true },
    });
    if (!character) {
      send(socket, { type: "error", code: "character_not_found", message: "Character not found" });
      return;
    }

    const regionId = isRegionId(character.regionId) ? character.regionId : "market_cross";
    const client: WorldClient = {
      socket,
      accountId,
      characterId: character.id,
      worldId: requestedWorldId,
      name: character.name,
      totalLevel: totalLevel(character.skills),
      position: {
        regionId,
        x: character.tileX,
        y: character.tileY,
      },
    };

    const existing = this.clients.get(character.id);
    existing?.socket.close();
    this.clients.set(character.id, client);

    await prisma.character.update({
      where: { id: character.id },
      data: { worldId: requestedWorldId, regionId: client.position.regionId, tileX: client.position.x, tileY: client.position.y },
    });

    send(socket, {
      type: "joined",
      worldId: requestedWorldId,
      characterId: character.id,
      player: playerSnapshot(client),
      tickMs: WORLD_SHARDS.find((world) => world.id === requestedWorldId)?.tickMs ?? MMO_TICK_MS,
      serverTime: Date.now(),
    });
    this.sendRegionSnapshot(client);
    this.broadcastRegion(
      requestedWorldId,
      client.position.regionId,
      {
        type: "player_delta",
        players: [playerSnapshot(client)],
        removedPlayerIds: [],
        serverTime: Date.now(),
      },
      client.characterId
    );
  }

  private async move(
    client: WorldClient,
    message: Extract<WorldClientMessage, { type: "move_to" }>
  ): Promise<void> {
    const from = client.position;
    const region = getRegionConfig(from.regionId);
    const portal = region.portals.find(
      (entry) => entry.position.x === message.to.x && entry.position.y === message.to.y
    );
    const localTarget = portal ? portal.position : message.to;
    const path = findPath(region, from, localTarget);
    if (path.length === 0) {
      send(client.socket, {
        type: "error",
        code: "invalid_move",
        message: "That tile is not reachable",
        requestId: message.requestId,
      });
      return;
    }

    const previousRegion = client.position.regionId;
    const startedAt = Date.now();
    const endsAt = startedAt + Math.max(1, path.length - 1) * 240;
    const target = portal?.target ?? message.to;
    const finalPath = portal ? [...path, target] : path;

    client.position = target;
    client.path = {
      from,
      to: target,
      steps: finalPath,
      startedAt,
      endsAt,
    };

    await prisma.character.update({
      where: { id: client.characterId },
      data: {
        worldId: client.worldId,
        regionId: client.position.regionId,
        tileX: client.position.x,
        tileY: client.position.y,
      },
    });

    if (previousRegion !== client.position.regionId) {
      this.broadcastRegion(client.worldId, previousRegion, {
        type: "player_delta",
        players: [],
        removedPlayerIds: [entityId("player", client.characterId)],
        serverTime: Date.now(),
      });
      this.sendRegionSnapshot(client);
    }

    this.broadcastRegion(client.worldId, client.position.regionId, {
      type: "player_delta",
      players: [playerSnapshot(client)],
      removedPlayerIds: [],
      serverTime: Date.now(),
    });
  }

  private tick(): void {
    const now = Date.now();
    for (const client of this.clients.values()) {
      if (client.path && client.path.endsAt <= now) {
        client.path = undefined;
        this.broadcastRegion(client.worldId, client.position.regionId, {
          type: "player_delta",
          players: [playerSnapshot(client)],
          removedPlayerIds: [],
          serverTime: now,
        });
      }
    }
  }

  private sendRegionSnapshot(client: WorldClient): void {
    const region = getRegionConfig(client.position.regionId);
    const entities = [
      ...staticEntities(region),
      ...Array.from(this.clients.values())
        .filter(
          (other) =>
            other.worldId === client.worldId &&
            other.position.regionId === client.position.regionId
        )
        .map(playerSnapshot),
    ];

    const snapshot: RegionSnapshot = {
      regionId: region.id,
      width: region.width,
      height: region.height,
      chunkSize: 16,
      terrain: region.map.layers.find((layer) => layer.name === "Terrain")?.data ?? [],
      blocked: region.blocked,
      entities,
    };
    send(client.socket, { type: "region_snapshot", snapshot, serverTime: Date.now() });
  }

  private broadcastRegion(
    worldId: WorldId,
    regionId: RegionId,
    message: WorldServerMessage,
    exceptCharacterId?: string
  ): void {
    for (const client of this.clients.values()) {
      if (
        client.worldId !== worldId ||
        client.position.regionId !== regionId ||
        client.characterId === exceptCharacterId
      ) {
        continue;
      }
      send(client.socket, message);
    }
  }

  private clientForSocket(socket: WebSocket): WorldClient | null {
    for (const client of this.clients.values()) {
      if (client.socket === socket) return client;
    }
    return null;
  }

  private removeSocket(socket: WebSocket): void {
    const client = this.clientForSocket(socket);
    if (!client) return;
    this.clients.delete(client.characterId);
    this.broadcastRegion(client.worldId, client.position.regionId, {
      type: "player_delta",
      players: [],
      removedPlayerIds: [entityId("player", client.characterId)],
      serverTime: Date.now(),
    });
  }
}

function isRegionId(value: string): value is RegionId {
  return value in {
    market_cross: true,
    west_aether_grove: true,
    eastern_quarry: true,
    market_hall_interior: true,
  };
}

export const worldRuntime = new WorldRuntime();
