import * as BABYLON from "@babylonjs/core";
import { World } from "./world";
import { Player } from "./player";

export class GameScene {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera!: BABYLON.Camera;
  private world!: World;
  private player!: Player;

  constructor(canvas: HTMLCanvasElement) {
    console.log("Creating Babylon.js engine...");
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.08, 0.12, 0.16, 1);

    this.setupCamera();
    this.setupLighting();
    this.world = new World(this.scene);
    this.world.create(20, 20);
    this.player = new Player(this.scene);

    console.log("✓ Engine created");
    console.log("✓ Scene created");
    console.log("✓ Camera set up");
    console.log("✓ Lighting set up");
    console.log("✓ World created with isometric tiles");
    console.log("✓ Player spawned");
  }

  private setupCamera(): void {
    // Isometric-style camera: top-down angled view
    const cam = new BABYLON.ArcRotateCamera(
      "isometricCamera",
      Math.PI * 0.25,    // Alpha (rotation around Y)
      Math.PI * 0.4,     // Beta (elevation angle)
      120,               // Radius (distance)
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    cam.attachControl(this.engine.getRenderingCanvas(), true);
    cam.inertia = 0.8;
    cam.speed = 0;
    cam.wheelPrecision = 1;
    cam.pinchPrecision = 100;
    this.camera = cam;
  }

  private setupLighting(): void {
    const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 1), this.scene);
    hemiLight.intensity = 0.7;

    const sunLight = new BABYLON.PointLight("sun", new BABYLON.Vector3(50, 60, 50), this.scene);
    sunLight.intensity = 0.5;
    sunLight.range = 500;
  }

  render(): void {
    console.log("Starting render loop...");
    this.engine.runRenderLoop(() => {
      this.player.update();
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    console.log("✓ Render loop started");
  }

  getPlayer(): Player {
    return this.player;
  }

  dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }
}
