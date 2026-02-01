import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/gui';

/**
 * Main application entry point
 */
class ServerSurvival {
  private canvas: HTMLCanvasElement;
  private engine: Engine;

  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize Babylon.js engine
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    // Start the game
    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('Server Survival - Initializing...');
    
    // TODO: Initialize game systems
    // TODO: Load assets
    // TODO: Create initial scene (BootScene)
    
    // For now, create a simple test scene
    this.createTestScene();
    
    // Start the render loop
    this.engine.runRenderLoop(() => {
      this.engine.scenes.forEach((scene) => {
        scene.render();
      });
    });
  }

  private createTestScene(): void {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color3(0.12, 0.14, 0.15);

    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 4,
      Math.PI / 3,
      20,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(this.canvas, true);
    camera.wheelPrecision = 50;
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    // Lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Ground
    const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;

    // Test cube
    const cube = MeshBuilder.CreateBox('cube', { size: 2 }, scene);
    cube.position.y = 1;
    const cubeMaterial = new StandardMaterial('cubeMat', scene);
    cubeMaterial.diffuseColor = new Color3(0.2, 0.6, 1);
    cube.material = cubeMaterial;

    console.log('Test scene created successfully');
  }

  dispose(): void {
    this.engine.dispose();
  }
}

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ServerSurvival();
  });
} else {
  new ServerSurvival();
}

// Export for testing
export { ServerSurvival };
