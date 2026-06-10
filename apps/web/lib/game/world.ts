import * as BABYLON from "@babylonjs/core";
import { gridToWorld, TILE_WIDTH, TILE_DEPTH } from "./isometric";

export class World {
  tiles: BABYLON.Mesh[] = [];

  constructor(private scene: BABYLON.Scene) {}

  create(width: number = 20, height: number = 20): void {
    console.log(`Creating ${width}x${height} isometric world...`);

    // Tile color palette
    const colors = {
      grass: new BABYLON.Color3(0.25, 0.65, 0.25),
      darkGrass: new BABYLON.Color3(0.2, 0.55, 0.2),
      stone: new BABYLON.Color3(0.5, 0.5, 0.52),
      ore: new BABYLON.Color3(0.8, 0.45, 0.15),
      water: new BABYLON.Color3(0.15, 0.4, 0.65),
    };

    // Seeded random for consistent world gen
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Generate varied terrain
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const rand = seededRandom();
        let color = colors.grass;

        // Terrain variation
        if (rand < 0.08) color = colors.darkGrass;
        else if (rand < 0.12) color = colors.stone;
        else if (rand < 0.16) color = colors.ore;
        else if (rand < 0.02) color = colors.water;

        this.addTile(x, y, color);
      }
    }

    console.log(`✓ Created ${this.tiles.length} tiles`);
  }

  private addTile(gridX: number, gridY: number, color: BABYLON.Color3): void {
    const { x, z } = gridToWorld(gridX, gridY);

    const tile = BABYLON.MeshBuilder.CreateGround(
      `tile_${gridX}_${gridY}`,
      { width: TILE_WIDTH, height: TILE_DEPTH },
      this.scene
    );
    tile.position = new BABYLON.Vector3(x, -0.1, z);

    const mat = new BABYLON.StandardMaterial(`mat_${gridX}_${gridY}`, this.scene);
    mat.emissiveColor = color;
    mat.backFaceCulling = true;
    tile.material = mat;

    this.tiles.push(tile);
  }
}
