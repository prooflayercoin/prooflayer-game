import * as BABYLON from "@babylonjs/core";

export class GameSceneSimple {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;

  constructor(canvas: HTMLCanvasElement) {
    try {
      console.log("Canvas:", canvas);
      console.log("Canvas rect:", canvas.getBoundingClientRect());
      console.log("BABYLON:", typeof BABYLON);

      console.log("Creating Babylon.js engine...");
      this.engine = new BABYLON.Engine(canvas, true);
      console.log("✓ Engine created", this.engine);

      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color4(0.1, 0.15, 0.2, 1);
      console.log("✓ Scene created");

      this.setupCamera();
      console.log("✓ Camera set up");

      this.setupLighting();
      console.log("✓ Lighting set up");

      this.createSimpleWorld();
      console.log("✓ World created");
    } catch (err) {
      console.error("Failed to construct scene:", err);
      throw err;
    }
  }

  private setupCamera(): void {
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 4,
      Math.PI / 3,
      100,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    camera.attachControl(this.engine.getRenderingCanvas(), true);
  }

  private setupLighting(): void {
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0.5), this.scene);
  }

  private createSimpleWorld(): void {
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.5, 0.2);
    ground.material = groundMat;

    // Simple player (red box)
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 5 }, this.scene);
    player.position.y = 3;
    const playerMat = new BABYLON.StandardMaterial("playerMat", this.scene);
    playerMat.emissiveColor = new BABYLON.Color3(1, 0.2, 0.2);
    player.material = playerMat;

    console.log("Simple world created with ground and player");
  }

  render(): void {
    console.log("Starting render loop...");
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
    console.log("Render loop started");
  }

  getPlayer(): { setAnimation: (anim: string) => void } {
    return {
      setAnimation: () => {
        // TODO: implement animation switching
      },
    };
  }

  dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }
}
