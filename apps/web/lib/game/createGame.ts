import Phaser from "phaser";
import { ProoflayerScene } from "./ProoflayerScene";
import type { GameBridge, GameController } from "./types";

export function createProoflayerGame(
  parent: HTMLElement,
  bridge: GameBridge
): GameController {
  const scene = new ProoflayerScene(bridge);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#10292d",
    transparent: false,
    pixelArt: false,
    antialias: true,
    roundPixels: true,
    render: {
      antialias: true,
      powerPreference: "high-performance",
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    scene,
  });

  return {
    destroy: () => game.destroy(true),
    setActiveAction: (actionId) => scene.setActiveAction(actionId),
  };
}
