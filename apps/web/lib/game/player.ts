import * as BABYLON from "@babylonjs/core";
import { gridToWorld, TILE_WIDTH } from "./isometric";

export type PlayerAnimation = "idle" | "mining" | "walking";

export class Player {
  mesh: BABYLON.Mesh;
  private currentAnimation: PlayerAnimation = "idle";

  constructor(
    private scene: BABYLON.Scene,
    gridX: number = 8,
    gridY: number = 8
  ) {
    const { x, z } = gridToWorld(gridX, gridY);

    // Create a simple box for the player character
    this.mesh = BABYLON.MeshBuilder.CreateBox(`player`, { size: TILE_WIDTH * 0.6 }, scene);
    this.mesh.position = new BABYLON.Vector3(x, TILE_WIDTH * 0.3, z);

    const mat = new BABYLON.StandardMaterial("playerMat", scene);
    mat.emissiveColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red
    this.mesh.material = mat;
  }

  setAnimation(anim: PlayerAnimation): void {
    if (this.currentAnimation === anim) return;
    this.currentAnimation = anim;
    // TODO: Change color or material based on animation
    const colors = {
      idle: new BABYLON.Color3(0.8, 0.2, 0.2),
      mining: new BABYLON.Color3(0.2, 0.2, 0.8),
      walking: new BABYLON.Color3(0.2, 0.8, 0.2),
    };
    const mat = this.mesh.material as BABYLON.StandardMaterial;
    if (mat) {
      mat.emissiveColor = colors[anim];
    }
  }

  update(): void {
    // Placeholder for animation frame updates
  }
}
