import Phaser from "phaser";
import { GAME_ASSETS, PLAYER_DIRECTIONS, PLAYER_WORK } from "./assets";
import type { GameBridge, WorldInteraction } from "./types";
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

const PLAYER_START = { x: 10, y: 7 };

export class ProoflayerScene extends Phaser.Scene {
  private readonly bridge: GameBridge;
  private player!: Phaser.GameObjects.Sprite;
  private playerGrid = { ...PLAYER_START };
  private moving = false;
  private activeActionId: string | null = null;
  private activeNode: Phaser.GameObjects.Image | null = null;
  private selectionRing!: Phaser.GameObjects.Ellipse;
  private nameplate!: Phaser.GameObjects.Text;

  constructor(bridge: GameBridge) {
    super({ key: "prooflayer-world" });
    this.bridge = bridge;
  }

  preload(): void {
    for (const [key, path] of Object.entries(GAME_ASSETS.terrain)) {
      this.load.image(`terrain-${key}`, path);
    }
    for (const [key, path] of Object.entries(GAME_ASSETS.objects)) {
      this.load.image(`object-${key}`, path);
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
    this.createTerrain();
    this.createWorldObjects();
    this.createNpcs();
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
    } else {
      this.player.stop();
      this.player.setTexture("player-idle-0");
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

  private createTerrain(): void {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      for (let y = 0; y < MAP_SIZE; y += 1) {
        const world = this.gridToWorld(x, y);
        const isRiver = y === 17;
        const isBridge = isRiver && (x === 9 || x === 10);
        let texture = isPathTile(x, y) ? "terrain-dirt" : "terrain-grass";
        if (isRiver) texture = isBridge ? "terrain-bridgeNS" : "terrain-water";

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
      this.selectObject(image, world.x, world.y);
      this.bridge.onHover?.(interaction);
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
    camera.setBackgroundColor("#10292d");
    camera.setBounds(-1100, -200, 2200, 1500);
    camera.startFollow(this.player, true, 0.08, 0.08, 0, 90);
    camera.setZoom(this.scale.width < 700 ? 0.82 : 1.12);

    this.input.on(
      "wheel",
      (_pointer: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => {
        camera.setZoom(Phaser.Math.Clamp(camera.zoom - dy * 0.0007, 0.72, 1.45));
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
    this.movePlayerTo(
      Phaser.Math.Clamp(this.playerGrid.x + dx, 0, MAP_SIZE - 1),
      Phaser.Math.Clamp(this.playerGrid.y + dy, 0, MAP_SIZE - 1)
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
    this.activeNode?.clearTint();
    this.activeNode = null;
  }

  private gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: (gridX - gridY) * (TILE_WIDTH / 2),
      y: (gridX + gridY) * (TILE_HEIGHT / 2),
    };
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
}
