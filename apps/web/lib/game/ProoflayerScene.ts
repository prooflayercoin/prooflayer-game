import Phaser from "phaser";
import { GAME_ASSETS, PLAYER_DIRECTIONS, PLAYER_WORK } from "./assets";
import type { GameBridge, WorldInteraction } from "./types";
import type {
  EntitySnapshot,
  PlayerSnapshot,
  RegionId,
  RegionSnapshot,
  WorldPosition,
} from "@prooflayer/shared";
import {
  BUILDINGS,
  DECORATIONS,
  isPathTile,
  MAP_SIZE,
  NPCS,
  RESOURCE_NODES,
  TILE_HEIGHT,
  TILE_WIDTH,
  type WorldObjectData,
} from "./world-data";

const PLAYER_START = { x: 32, y: 32 };
const MARKET_CROSS_SHOWCASE_MAP_KEY = "tiled-market-cross-showcase";
const MARKET_CROSS_REGION_ID: RegionId = "market_cross";

type PlayerView = {
  sprite: Phaser.GameObjects.Sprite;
  ring: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
};

type TiledProperty = {
  name: string;
  type: string;
  value: string | number | boolean;
};

type TiledObjectLayer = {
  name: string;
  type: string;
  objects?: Array<{
    id: number;
    name: string;
    type: string;
    properties?: TiledProperty[];
  }>;
};

type TiledTileLayer = {
  name: string;
  type: string;
  data?: number[];
};

type TiledLayer = TiledObjectLayer | TiledTileLayer;

type TiledShowcaseMap = {
  width?: number;
  height?: number;
  layers?: TiledLayer[];
};

export class ProoflayerScene extends Phaser.Scene {
  private readonly bridge: GameBridge;
  private player!: Phaser.GameObjects.Sprite;
  private playerGrid = { ...PLAYER_START };
  private localCharacterId: string | null = null;
  private currentRegionId: RegionId = "market_cross";
  private currentSnapshot: RegionSnapshot | null = null;
  private playerViews = new Map<string, PlayerView>();
  private serverRendered = false;
  private moving = false;
  private activeActionId: string | null = null;
  private activeNode: Phaser.GameObjects.Image | null = null;
  private activeNodeHalo: Phaser.GameObjects.Ellipse | null = null;
  private activeNodePulse: Phaser.Tweens.Tween | null = null;
  private selectionRing!: Phaser.GameObjects.Ellipse;
  private nameplate!: Phaser.GameObjects.Text;
  private activeMapWidth = MAP_SIZE;
  private activeMapHeight = MAP_SIZE;

  constructor(bridge: GameBridge) {
    super({ key: "prooflayer-world" });
    this.bridge = bridge;
  }

  preload(): void {
    this.load.json(
      MARKET_CROSS_SHOWCASE_MAP_KEY,
      "/prooflayer-made/maps/market-cross-showcase.json"
    );
    for (const [key, path] of Object.entries(GAME_ASSETS.terrain)) {
      this.load.image(`terrain-${key}`, path);
    }
    for (const [key, path] of Object.entries(GAME_ASSETS.objects)) {
      this.load.image(key, path);
    }
    for (const [key, path] of Object.entries(GAME_ASSETS.buildings)) {
      this.load.image(`building-${key}`, path);
    }
    for (const direction of PLAYER_DIRECTIONS) {
      this.load.image(`player-idle-${direction.direction}`, direction.idle);
      direction.run.forEach((path, frame) => {
        this.load.image(`player-run-${direction.direction}-${frame}`, path);
      });
    }
    PLAYER_WORK.forEach((path, frame) => {
      this.load.image(`player-work-${frame}`, path);
    });
  }

  create(): void {
    this.createAnimations();
    this.createShowcaseTerrain();
    this.createTiledMapObjects();
    this.createPlayer();
    this.configureCamera();
    this.configureInput();
    this.bridge.onReady?.();
  }

  setActiveAction(actionId: string | null): void {
    this.activeActionId = actionId;
    if (!this.player || this.moving) return;
    if (actionId) {
      this.player.play("player-work", true);
      this.startActiveNodePulse();
    } else {
      this.player.stop();
      this.player.setTexture("player-idle-0");
      this.stopActiveNodePulse();
    }
  }

  setLocalCharacterId(characterId: string | null): void {
    this.localCharacterId = characterId;
  }

  applyRegionSnapshot(snapshot: RegionSnapshot): void {
    this.currentSnapshot = snapshot;
    this.currentRegionId = snapshot.regionId;
    this.serverRendered = true;
    this.moving = false;
    this.activeNodePulse?.stop();
    this.activeNodePulse = null;
    this.activeNode = null;
    this.activeNodeHalo = null;
    this.children.removeAll(true);
    this.playerViews.clear();
    this.activeMapWidth = snapshot.width;
    this.activeMapHeight = snapshot.height;

    this.createServerTerrain(snapshot);
    this.createTiledMapObjects(snapshot);
    snapshot.entities
      .filter((entity) => entity.kind !== "player")
      .forEach((entity) => this.createServerEntity(entity));
    this.applyPlayerDelta(
      snapshot.entities.filter((entity): entity is PlayerSnapshot => entity.kind === "player"),
      []
    );
    this.configureServerCamera(snapshot);
  }

  applyPlayerDelta(players: PlayerSnapshot[], removedPlayerIds: string[]): void {
    for (const removedId of removedPlayerIds) {
      const view = this.playerViews.get(removedId);
      view?.sprite.destroy();
      view?.ring.destroy();
      view?.label.destroy();
      this.playerViews.delete(removedId);
    }

    for (const player of players) {
      this.upsertPlayer(player);
    }
  }

  private createAnimations(): void {
    for (const direction of PLAYER_DIRECTIONS) {
      this.anims.create({
        key: `player-run-${direction.direction}`,
        frames: direction.run.map((_, frame) => ({
          key: `player-run-${direction.direction}-${frame}`,
        })),
        frameRate: 13,
        repeat: -1,
      });
    }
    this.anims.create({
      key: "player-work",
      frames: PLAYER_WORK.map((_, frame) => ({ key: `player-work-${frame}` })),
      frameRate: 9,
      repeat: -1,
    });
  }

  private createServerTerrain(snapshot: RegionSnapshot): void {
    for (let x = 0; x < snapshot.width; x += 1) {
      for (let y = 0; y < snapshot.height; y += 1) {
        const world = this.gridToWorld(x, y);
        const terrainId = snapshot.terrain[y * snapshot.width + x] ?? 1;
        const tile = this.add
          .image(world.x, world.y, this.serverTerrainTexture(terrainId, x, y))
          .setOrigin(0.5, 0.72)
          .setDepth(world.y - 20)
          .setInteractive({ useHandCursor: true });

        tile.on("pointerdown", () => {
          this.clearSelection();
          this.bridge.onHover?.(null);
          this.bridge.onMove?.();
          this.bridge.onMoveIntent?.({ regionId: snapshot.regionId, x, y });
        });
      }
    }
  }

  private createShowcaseTerrain(): void {
    const map = this.showcaseMap();
    const terrainLayer = map?.layers?.find(
      (candidate): candidate is TiledTileLayer =>
        candidate.type === "tilelayer" && candidate.name === "Terrain"
    );
    const width = map?.width ?? MAP_SIZE;
    const height = map?.height ?? MAP_SIZE;
    this.activeMapWidth = width;
    this.activeMapHeight = height;

    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        const world = this.gridToWorld(x, y);
        const terrainId = terrainLayer?.data?.[y * width + x] ?? 1;
        const tile = this.add
          .image(world.x, world.y, this.serverTerrainTexture(terrainId, x, y))
          .setOrigin(0.5, 0.72)
          .setDepth(world.y - 20)
          .setInteractive({ useHandCursor: true });

        tile.on("pointerdown", () => {
          this.clearSelection();
          this.bridge.onHover?.(null);
          this.bridge.onMove?.();
          this.movePlayerTo(x, y);
        });
      }
    }
  }

  private createTiledMapObjects(snapshot?: RegionSnapshot): void {
    if (snapshot && snapshot.regionId !== MARKET_CROSS_REGION_ID) return;
    const map = this.showcaseMap();
    const layer = map?.layers?.find(
      (candidate): candidate is TiledObjectLayer =>
        candidate.type === "objectgroup" && candidate.name === "WorldObjects"
    );
    if (!layer?.objects) return;

    for (const object of layer.objects) {
      const properties = this.tiledProperties(object.properties);
      const assetKey = this.propertyString(properties, "assetKey");
      if (!assetKey || !this.textures.exists(assetKey)) continue;

      const tileX = this.propertyNumber(properties, "tileX", 32);
      const tileY = this.propertyNumber(properties, "tileY", 32);
      const scale = this.propertyNumber(properties, "scale", 1);
      const yOffset = this.propertyNumber(properties, "yOffset", 0);
      const depthOffset = this.propertyNumber(properties, "depthOffset", 10);
      const originY = this.propertyNumber(properties, "originY", 0.88);
      const world = this.gridToWorld(tileX, tileY);
      const image = this.add
        .image(world.x, world.y + yOffset, assetKey)
        .setOrigin(0.5, originY)
        .setScale(scale)
        .setDepth(world.y + depthOffset);

      if (assetKey.startsWith("tree-")) {
        this.tweens.add({
          targets: image,
          scaleX: image.scaleX * 1.012,
          angle: 0.3,
          duration: 2600 + ((tileX * 137 + tileY * 79) % 900),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      const labelText = this.propertyString(properties, "label");
      const kind = this.propertyString(properties, "kind") as WorldInteraction["kind"] | "";
      if (!labelText && !kind) continue;

      const interaction: WorldInteraction = {
        id: `map:${object.id}`,
        label: labelText || object.name,
        detail: object.type,
        kind: kind || "npc",
      };

      const label = labelText
        ? this.add
            .text(world.x, world.y + yOffset - 92 * scale, labelText, {
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
              color: "#fff7dd",
              stroke: "#1d261e",
              strokeThickness: 4,
            })
            .setOrigin(0.5, 1)
            .setDepth(world.y + depthOffset + 5)
        : null;

      image.setInteractive({ useHandCursor: true });
      image.on("pointerover", () => {
        image.setTint(0xffe2a3);
        label?.setColor("#ffe08a");
        this.bridge.onHover?.(interaction);
      });
      image.on("pointerout", () => {
        if (this.activeNode !== image) image.clearTint();
        label?.setColor("#fff7dd");
        this.bridge.onHover?.(null);
      });
      image.on("pointerdown", () => {
        this.bridge.onMove?.();
        this.selectObject(image, world.x, world.y + yOffset);
        this.bridge.onHover?.(interaction);
        this.showActionBurst(world.x, world.y + yOffset - 28, interaction.kind);
        this.showFloatText(
          this.effectLabel(interaction.kind),
          world.x,
          world.y + yOffset - 72,
          interaction.kind
        );
        const target = {
          regionId: snapshot?.regionId ?? MARKET_CROSS_REGION_ID,
          x: Phaser.Math.Clamp(tileX, 0, this.activeMapWidth - 1),
          y: Phaser.Math.Clamp(tileY + 1, 0, this.activeMapHeight - 1),
        };
        if (snapshot) this.bridge.onMoveIntent?.(target);
        else this.movePlayerTo(target.x, target.y);
      });
    }
  }

  private showcaseMap(): TiledShowcaseMap | undefined {
    return this.cache.json.get(MARKET_CROSS_SHOWCASE_MAP_KEY) as TiledShowcaseMap | undefined;
  }

  private createServerEntity(entity: EntitySnapshot): void {
    const world = this.positionToWorld(entity.position);
    const texture = this.entityTexture(entity);
    const image = this.add
      .image(world.x, world.y, texture)
      .setOrigin(0.5, 0.88)
      .setScale(this.entityScale(entity))
      .setDepth(world.y + 12)
      .setInteractive({ useHandCursor: true });

    if (entity.kind === "npc" && entity.hostile) {
      image.setTint(0xffb091);
    }
    if (entity.kind === "bank" || entity.kind === "shop" || entity.kind === "portal") {
      image.setTint(0xffe2a3);
    }

    const label = this.add
      .text(world.x, world.y - 58, entity.name, {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#fff7dd",
        stroke: "#1d261e",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(world.y + 24);

    const interaction = this.entityInteraction(entity);
    image.on("pointerover", () => {
      image.setTint(0xffe2a3);
      label.setColor("#ffe08a");
      this.bridge.onHover?.(interaction);
    });
    image.on("pointerout", () => {
      if (entity.kind === "npc" && entity.hostile) image.setTint(0xffb091);
      else if (entity.kind === "bank" || entity.kind === "shop" || entity.kind === "portal") image.setTint(0xffe2a3);
      else image.clearTint();
      label.setColor("#fff7dd");
      this.bridge.onHover?.(null);
    });
    image.on("pointerdown", () => {
      this.bridge.onMove?.();
      this.selectObject(image, world.x, world.y);
      this.bridge.onHover?.(interaction);
      this.showActionBurst(world.x, world.y - 28, interaction.kind);
      this.showFloatText(this.effectLabel(interaction.kind), world.x, world.y - 72, interaction.kind);
      this.bridge.onMoveIntent?.(entity.position);
      this.bridge.onInteract?.(interaction);
    });
  }

  private upsertPlayer(player: PlayerSnapshot): void {
    const playerId = player.id;
    const isLocal = player.characterId === this.localCharacterId;
    const target = this.positionToWorld(player.position);
    let view = this.playerViews.get(playerId);

    if (!view) {
      const ring = this.add
        .ellipse(target.x, target.y - 2, isLocal ? 50 : 42, isLocal ? 22 : 18, isLocal ? 0xffd77a : 0x79d7ff, 0.2)
        .setStrokeStyle(2, isLocal ? 0xffe6a6 : 0x9be5ff, 0.9)
        .setDepth(target.y + 14);
      const sprite = this.add
        .sprite(target.x, target.y, "player-idle-0")
        .setOrigin(0.5, 0.92)
        .setScale(isLocal ? 0.66 : 0.58)
        .setDepth(target.y + 20);
      if (!isLocal) sprite.setTint(0x9bd7ff);
      const label = this.add
        .text(target.x, target.y - 76, player.name, {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: isLocal ? "#ffffff" : "#d8f5ff",
          stroke: "#162018",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(target.y + 24);
      view = { sprite, ring, label };
      this.playerViews.set(playerId, view);
    }

    if (isLocal) {
      this.player = view.sprite;
      this.selectionRing = view.ring;
      this.nameplate = view.label;
      this.playerGrid = { x: player.position.x, y: player.position.y };
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 50);
    }

    const currentDirection = this.directionForVector(target.x - view.sprite.x, target.y - view.sprite.y);
    const duration = player.path
      ? Phaser.Math.Clamp(player.path.endsAt - Date.now(), 120, 1800)
      : 220;
    if (duration > 120 && Phaser.Math.Distance.Between(view.sprite.x, view.sprite.y, target.x, target.y) > 5) {
      view.sprite.play(`player-run-${currentDirection}`, true);
      this.tweens.killTweensOf([view.sprite, view.ring, view.label]);
      this.tweens.add({
        targets: [view.sprite, view.ring, view.label],
        x: target.x,
        y: (_target: unknown, _key: string, _value: number, index: number) => {
          if (index === 1) return target.y - 2;
          if (index === 2) return target.y - 76;
          return target.y;
        },
        duration,
        ease: "Sine.easeInOut",
        onUpdate: () => this.updatePlayerDepth(view),
        onComplete: () => {
          view.sprite.stop();
          view.sprite.setTexture(`player-idle-${currentDirection}`);
          this.updatePlayerDepth(view);
        },
      });
    } else {
      view.sprite.setPosition(target.x, target.y);
      view.ring.setPosition(target.x, target.y - 2);
      view.label.setPosition(target.x, target.y - 76);
      view.sprite.setTexture(`player-idle-${currentDirection}`);
      this.updatePlayerDepth(view);
    }
  }

  private updatePlayerDepth(view: PlayerView): void {
    const depth = view.sprite.y + 20;
    view.sprite.setDepth(depth);
    view.ring.setDepth(depth - 6);
    view.label.setDepth(depth + 4);
  }

  private configureServerCamera(snapshot: RegionSnapshot): void {
    const topLeft = this.gridToWorld(0, 0);
    const topRight = this.gridToWorld(snapshot.width - 1, 0);
    const bottomLeft = this.gridToWorld(0, snapshot.height - 1);
    const bottomRight = this.gridToWorld(snapshot.width - 1, snapshot.height - 1);
    const xs = [topLeft.x, topRight.x, bottomLeft.x, bottomRight.x];
    const ys = [topLeft.y, topRight.y, bottomLeft.y, bottomRight.y];
    const minX = Math.min(...xs) - 900;
    const maxX = Math.max(...xs) + 900;
    const minY = Math.min(...ys) - 450;
    const maxY = Math.max(...ys) + 650;
    this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY);
    this.cameras.main.setZoom(this.scale.width < 900 ? 0.88 : 1);
    if (this.player) this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 50);
  }

  private serverTerrainTexture(tileId: number, x: number, y: number): string {
    if (tileId === 2) return this.terrainVariant("dirt", x, y);
    if (tileId === 3) return this.terrainVariant("water", x, y);
    if (tileId === 4) return `terrain-stone-${(x * 11 + y * 17) % 3 === 0 ? "b" : "a"}`;
    if (tileId === 5) return `terrain-stone-${(x * 7 + y * 13) % 4 === 0 ? "b" : "a"}`;
    return this.terrainVariant("grass", x, y);
  }

  private entityTexture(entity: EntitySnapshot): string {
    if (entity.kind === "resource") {
      if (entity.skillId === "reaping") return entity.name.includes("Bloom") ? "nature-dawn-bloom" : "nature-aether-stalk";
      if (entity.skillId === "quarrying") return "mine-ore-rocks";
      return "prop-chest";
    }
    if (entity.kind === "npc") return "player-idle-0";
    if (entity.kind === "bank") return "prop-chest";
    if (entity.kind === "shop") return "prop-cart-stall";
    return "sign-market";
  }

  private entityScale(entity: EntitySnapshot): number {
    if (entity.kind === "resource") return entity.skillId === "quarrying" ? 0.34 : 0.56;
    if (entity.kind === "npc") return 0.55;
    if (entity.kind === "shop") return 0.42;
    return 0.32;
  }

  private entityInteraction(entity: EntitySnapshot): WorldInteraction {
    if (entity.kind === "resource") {
      const kind: WorldInteraction["kind"] = entity.skillId === "quarrying" ? "mine" : "gather";
      return {
        id: entity.id,
        label: entity.name,
        detail: `${entity.skillId} node`,
        actionId: entity.actionId,
        skillId: entity.skillId,
        kind,
      };
    }

    return {
      id: entity.id.replace(/^(npc|bank|shop|portal):/, ""),
      label: entity.kind === "portal" ? `Travel: ${entity.name}` : entity.name,
      detail: entity.kind,
      kind: "npc",
    };
  }

  private createTerrain(): void {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      for (let y = 0; y < MAP_SIZE; y += 1) {
        const world = this.gridToWorld(x, y);
        const isRiver =
          y === 17 ||
          x <= 1 ||
          (x === 2 && y >= 9) ||
          (x === 3 && y >= 13);
        const isBridge =
          (y === 17 && (x === 9 || x === 10)) ||
          (x <= 2 && (y === 8 || y === 9));
        let texture = isPathTile(x, y)
          ? this.terrainVariant("dirt", x, y)
          : this.terrainVariant("grass", x, y);
        if (isRiver) texture = isBridge ? "terrain-bridgeNS" : this.terrainVariant("water", x, y);

        const tile = this.add
          .image(world.x, world.y, texture)
          .setOrigin(0.5, 0.72)
          .setDepth(world.y - 20)
          .setInteractive({ useHandCursor: true });

        tile.on("pointerdown", () => {
          this.clearSelection();
          this.bridge.onHover?.(null);
          this.bridge.onMove?.();
          this.movePlayerTo(x, y);
        });
      }
    }
  }

  private createWorldObjects(): void {
    [...BUILDINGS, ...DECORATIONS, ...RESOURCE_NODES].forEach((data) => {
      this.createWorldObject(data);
    });
  }

  private createWorldObject(data: WorldObjectData): void {
    const world = this.gridToWorld(data.x, data.y);
    const image = this.add
      .image(world.x, world.y + (data.yOffset ?? 0), data.texture)
      .setOrigin(0.5, 0.88)
      .setScale(data.scale ?? 1)
      .setDepth(world.y + 10);

    this.applyAmbientMotion(image, data);

    if (!data.label || !data.kind) return;

    const interaction: WorldInteraction = {
      id: data.id,
      label: data.label,
      detail: data.detail ?? "",
      actionId: data.actionId,
      skillId: data.skillId,
      kind: data.kind,
    };

    image.setInteractive({ useHandCursor: true });
    image.on("pointerover", () => {
      image.setTint(0xffe2a3);
      this.bridge.onHover?.(interaction);
    });
    image.on("pointerout", () => {
      if (this.activeNode !== image) image.clearTint();
      this.bridge.onHover?.(null);
    });
    image.on("pointerdown", () => {
      this.bridge.onMove?.();
      this.selectObject(image, world.x, world.y);
      this.bridge.onHover?.(interaction);
      this.showActionBurst(world.x, world.y - 28, interaction.kind);
      this.showFloatText(this.effectLabel(interaction.kind), world.x, world.y - 72, interaction.kind);
      const target = {
        x: Phaser.Math.Clamp(data.x + (data.interactOffset?.x ?? 0), 0, MAP_SIZE - 1),
        y: Phaser.Math.Clamp(data.y + (data.interactOffset?.y ?? 1), 0, MAP_SIZE - 1),
      };
      this.movePlayerTo(target.x, target.y, () => this.bridge.onInteract?.(interaction));
    });
  }

  private createNpcs(): void {
    NPCS.forEach((npc) => {
      const world = this.gridToWorld(npc.x, npc.y);
      const sprite = this.add
        .image(world.x, world.y, `player-idle-${npc.direction}`)
        .setOrigin(0.5, 0.92)
        .setScale(0.55)
        .setDepth(world.y + 20)
        .setTint(npc.id === "warden-vale" ? 0xd8ecff : 0xffe0b5)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(world.x, world.y - 68, npc.name, {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: "#fff7dd",
          stroke: "#1d261e",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(world.y + 25);

      if (npc.quest) {
        this.add
          .text(world.x, world.y - 91, "!", {
            fontFamily: "Georgia, serif",
            fontSize: "26px",
            fontStyle: "bold",
            color: "#ffe08a",
            stroke: "#4b3214",
            strokeThickness: 5,
          })
          .setOrigin(0.5)
          .setDepth(world.y + 26);
      }

      const interaction: WorldInteraction = {
        id: npc.id,
        label: `Speak to ${npc.name}`,
        detail: npc.subtitle,
        kind: "npc",
      };
      sprite.on("pointerover", () => {
        sprite.setTint(0xffe2a3);
        label.setColor("#ffe08a");
        this.bridge.onHover?.(interaction);
      });
      sprite.on("pointerout", () => {
        sprite.setTint(npc.id === "warden-vale" ? 0xd8ecff : 0xffe0b5);
        label.setColor("#fff7dd");
        this.bridge.onHover?.(null);
      });
      sprite.on("pointerdown", () => {
        this.bridge.onMove?.();
        this.showActionBurst(world.x, world.y - 48, "npc");
        this.showFloatText("Talk", world.x, world.y - 96, "npc");
        this.movePlayerTo(npc.x, Math.min(MAP_SIZE - 1, npc.y + 1), () => {
          this.bridge.onInteract?.(interaction);
        });
      });
    });
  }

  private createPlayer(): void {
    const world = this.gridToWorld(PLAYER_START.x, PLAYER_START.y);
    this.selectionRing = this.add
      .ellipse(world.x, world.y - 2, 50, 22, 0xffd77a, 0.2)
      .setStrokeStyle(2, 0xffe6a6, 0.9)
      .setDepth(world.y + 14);

    this.player = this.add
      .sprite(world.x, world.y, "player-idle-0")
      .setOrigin(0.5, 0.92)
      .setScale(0.66)
      .setDepth(world.y + 20);

    this.nameplate = this.add
      .text(world.x, world.y - 76, "Apprentice", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#ffffff",
        stroke: "#162018",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(world.y + 24);
  }

  private configureCamera(): void {
    const camera = this.cameras.main;
    const topLeft = this.gridToWorld(0, 0);
    const topRight = this.gridToWorld(this.activeMapWidth - 1, 0);
    const bottomLeft = this.gridToWorld(0, this.activeMapHeight - 1);
    const bottomRight = this.gridToWorld(this.activeMapWidth - 1, this.activeMapHeight - 1);
    const xs = [topLeft.x, topRight.x, bottomLeft.x, bottomRight.x];
    const ys = [topLeft.y, topRight.y, bottomLeft.y, bottomRight.y];
    const minX = Math.min(...xs) - 900;
    const maxX = Math.max(...xs) + 900;
    const minY = Math.min(...ys) - 450;
    const maxY = Math.max(...ys) + 650;

    camera.setBackgroundColor("#10292d");
    camera.setBounds(minX, minY, maxX - minX, maxY - minY);
    camera.startFollow(this.player, true, 0.08, 0.08, 0, 50);
    camera.setZoom(this.scale.width < 900 ? 0.88 : 1);

    this.input.on(
      "wheel",
      (_pointer: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => {
        camera.setZoom(Phaser.Math.Clamp(camera.zoom - dy * 0.0007, 0.82, 1.58));
      }
    );
  }

  private configureInput(): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    this.input.keyboard?.on("keydown-W", () => this.stepPlayer(0, -1));
    this.input.keyboard?.on("keydown-A", () => this.stepPlayer(-1, 0));
    this.input.keyboard?.on("keydown-S", () => this.stepPlayer(0, 1));
    this.input.keyboard?.on("keydown-D", () => this.stepPlayer(1, 0));

    this.events.on("update", () => {
      if (this.moving || !cursors) return;
      if (Phaser.Input.Keyboard.JustDown(cursors.up)) this.stepPlayer(0, -1);
      else if (Phaser.Input.Keyboard.JustDown(cursors.down)) this.stepPlayer(0, 1);
      else if (Phaser.Input.Keyboard.JustDown(cursors.left)) this.stepPlayer(-1, 0);
      else if (Phaser.Input.Keyboard.JustDown(cursors.right)) this.stepPlayer(1, 0);
    });
  }

  private stepPlayer(dx: number, dy: number): void {
    if (this.moving) return;
    this.clearSelection();
    this.bridge.onMove?.();
    if (this.serverRendered && this.currentSnapshot) {
      this.bridge.onMoveIntent?.({
        regionId: this.currentRegionId,
        x: Phaser.Math.Clamp(this.playerGrid.x + dx, 0, this.currentSnapshot.width - 1),
        y: Phaser.Math.Clamp(this.playerGrid.y + dy, 0, this.currentSnapshot.height - 1),
      });
      return;
    }
    this.movePlayerTo(
      Phaser.Math.Clamp(this.playerGrid.x + dx, 0, this.activeMapWidth - 1),
      Phaser.Math.Clamp(this.playerGrid.y + dy, 0, this.activeMapHeight - 1)
    );
  }

  private movePlayerTo(gridX: number, gridY: number, onComplete?: () => void): void {
    if (this.moving) return;
    const destination = this.gridToWorld(gridX, gridY);
    const dx = destination.x - this.player.x;
    const dy = destination.y - this.player.y;
    const direction = this.directionForVector(dx, dy);
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, destination.x, destination.y);
    const duration = Phaser.Math.Clamp(distance * 2.5, 180, 1200);

    this.moving = true;
    this.player.play(`player-run-${direction}`, true);
    this.tweens.add({
      targets: [this.player, this.selectionRing, this.nameplate],
      x: destination.x,
      y: (_target: unknown, _key: string, _value: number, index: number) => {
        if (index === 1) return destination.y - 2;
        if (index === 2) return destination.y - 76;
        return destination.y;
      },
      duration,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        const depth = this.player.y + 20;
        this.player.setDepth(depth);
        this.selectionRing.setDepth(depth - 6);
        this.nameplate.setDepth(depth + 4);
      },
      onComplete: () => {
        this.playerGrid = { x: gridX, y: gridY };
        this.moving = false;
        if (this.activeActionId) this.player.play("player-work", true);
        else {
          this.player.stop();
          this.player.setTexture(`player-idle-${direction}`);
        }
        onComplete?.();
      },
    });
  }

  private selectObject(image: Phaser.GameObjects.Image, x: number, y: number): void {
    this.clearSelection();
    this.activeNode = image;
    image.setTint(0xffe2a3);
    this.activeNodeHalo = this.add
      .ellipse(x, y - 4, 72, 30, 0xffd56b, 0.18)
      .setStrokeStyle(2, 0xfff0a6, 0.65)
      .setDepth(image.depth - 1);
    this.tweens.add({
      targets: this.activeNodeHalo,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.36,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    if (this.activeActionId) this.startActiveNodePulse();
    this.tweens.add({
      targets: image,
      scaleX: image.scaleX * 1.08,
      scaleY: image.scaleY * 1.08,
      duration: 130,
      yoyo: true,
    });
    this.cameras.main.pan(x, y - 45, 250, "Sine.easeOut");
  }

  private clearSelection(): void {
    this.stopActiveNodePulse();
    this.activeNodeHalo?.destroy();
    this.activeNodeHalo = null;
    this.activeNode?.clearTint();
    this.activeNode?.setAlpha(1);
    this.activeNode = null;
  }

  private applyAmbientMotion(image: Phaser.GameObjects.Image, data: WorldObjectData): void {
    if (data.texture.startsWith("tree-")) {
      this.tweens.add({
        targets: image,
        scaleX: image.scaleX * 1.012,
        angle: 0.35,
        duration: 2600 + ((data.x * 137 + data.y * 79) % 900),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      return;
    }

    if (data.texture.startsWith("animal-")) {
      this.tweens.add({
        targets: image,
        y: image.y - 3,
        duration: 1400 + ((data.x * 91 + data.y * 53) % 700),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private startActiveNodePulse(): void {
    if (!this.activeNode) return;
    this.stopActiveNodePulse();
    this.activeNodePulse = this.tweens.add({
      targets: this.activeNode,
      alpha: 0.72,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private stopActiveNodePulse(): void {
    this.activeNodePulse?.stop();
    this.activeNodePulse = null;
    this.activeNode?.setAlpha(1);
  }

  private showActionBurst(x: number, y: number, kind: WorldInteraction["kind"]): void {
    const color = this.effectColor(kind);
    const radius = kind === "mine" || kind === "forge" ? 44 : 34;
    const count = kind === "npc" ? 5 : 8;
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const dot = this.add
        .circle(x, y, kind === "npc" ? 3 : 4, color, 0.95)
        .setDepth(y + 180);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius * 0.55,
        scale: 0.25,
        alpha: 0,
        duration: 430,
        ease: "Quad.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
    if (kind === "mine" || kind === "forge") {
      this.cameras.main.shake(90, 0.0018);
    }
  }

  private showFloatText(text: string, x: number, y: number, kind: WorldInteraction["kind"]): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: "Georgia, serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: `#${this.effectColor(kind).toString(16).padStart(6, "0")}`,
        stroke: "#241508",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(y + 210);
    this.tweens.add({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 900,
      ease: "Sine.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  private effectLabel(kind: WorldInteraction["kind"]): string {
    if (kind === "mine") return "Chip";
    if (kind === "forge") return "Temper";
    if (kind === "track") return "Track";
    if (kind === "distill") return "Brew";
    if (kind === "seal") return "Seal";
    if (kind === "npc") return "Talk";
    return "Gather";
  }

  private effectColor(kind: WorldInteraction["kind"]): number {
    if (kind === "mine") return 0xffc35a;
    if (kind === "forge") return 0xff8a4c;
    if (kind === "track") return 0xb6d784;
    if (kind === "distill") return 0x79d7ff;
    if (kind === "seal") return 0xcba6ff;
    if (kind === "npc") return 0xffdf7a;
    return 0x9bea6c;
  }

  private gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: (gridX - gridY) * (TILE_WIDTH / 2),
      y: (gridX + gridY) * (TILE_HEIGHT / 2),
    };
  }

  private positionToWorld(position: WorldPosition): { x: number; y: number } {
    return this.gridToWorld(position.x, position.y);
  }

  private terrainVariant(kind: "dirt" | "grass" | "water", x: number, y: number): string {
    const value = Math.abs(x * 37 + y * 19 + x * y * 7);
    if (kind === "grass") {
      const weighted = value % 12;
      if (weighted < 7) return "terrain-grass-a";
      if (weighted < 10) return "terrain-grass-b";
      return "terrain-grass-c";
    }
    if (kind === "dirt") return value % 5 === 0 ? "terrain-dirt-b" : "terrain-dirt-a";
    return value % 2 === 0 ? "terrain-water-a" : "terrain-water-b";
  }

  private directionForVector(dx: number, dy: number): number {
    const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    if (angle >= -22.5 && angle < 22.5) return 5;
    if (angle >= 22.5 && angle < 67.5) return 4;
    if (angle >= 67.5 && angle < 112.5) return 3;
    if (angle >= 112.5 && angle < 157.5) return 2;
    if (angle >= 157.5 || angle < -157.5) return 1;
    if (angle >= -157.5 && angle < -112.5) return 0;
    if (angle >= -112.5 && angle < -67.5) return 7;
    return 6;
  }

  private tiledProperties(properties: TiledProperty[] | undefined): Map<string, TiledProperty["value"]> {
    const result = new Map<string, TiledProperty["value"]>();
    properties?.forEach((property) => result.set(property.name, property.value));
    return result;
  }

  private propertyString(properties: Map<string, TiledProperty["value"]>, name: string): string {
    const value = properties.get(name);
    return typeof value === "string" ? value : "";
  }

  private propertyNumber(
    properties: Map<string, TiledProperty["value"]>,
    name: string,
    fallback: number
  ): number {
    const value = properties.get(name);
    return typeof value === "number" ? value : fallback;
  }
}
