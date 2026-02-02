import { Scene, Color4, ArcRotateCamera, HemisphericLight, Vector3 } from '@babylonjs/core';

/**
 * BootScene - Initial loading scene with asset loading
 */
export class BootScene {
  private scene: Scene;
  private isDisposed: boolean = false;
  private isLoaded: boolean = false;

  // Loading state
  private loadingProgress: number = 0;
  private onLoadComplete: ((scene: Scene) => void) | null = null;

  // Assets to load
  private assetsToLoad: string[] = [];
  private loadedAssets: string[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupScene();
  }

  /**
   * Setup the boot scene
   */
  private setupScene(): void {
    // Clear scene
    this.scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);

    // Setup camera
    this.setupCamera();

    // Setup lighting
    this.setupLighting();

    // Initialize asset loading
    this.initializeAssetLoading();
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const camera = new ArcRotateCamera(
      'bootCamera',
      -Math.PI / 2,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.scene.getEngine().getRenderingCanvas(), false);
    this.scene.activeCamera = camera;
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    const light = new HemisphericLight('light', Vector3.Up(), this.scene);
    light.intensity = 1;
  }

  /**
   * Initialize asset loading
   */
  private initializeAssetLoading(): void {
    // Define assets to load
    this.assetsToLoad = [
      // Textures
      'textures/firewall.png',
      'textures/cdn.png',
      'textures/load_balancer.png',
      'textures/cache.png',
      'textures/database.png',
      'textures/auto_scaler.png',
      'textures/traffic_static.png',
      'textures/traffic_read.png',
      'textures/traffic_write.png',
      'textures/traffic_upload.png',
      'textures/traffic_search.png',
      'textures/traffic_malicious.png',
      // Models (if using glTF models)
      // 'models/firewall.glb',
      // 'models/cdn.glb',
      // 'models/load_balancer.glb',
      // 'models/cache.glb',
      // 'models/database.glb',
      // 'models/auto_scaler.glb',
      // Sounds
      // 'sounds/place_service.mp3',
      // 'sounds/upgrade.mp3',
      // 'sounds/traffic_processed.mp3',
      // 'sounds/traffic_leaked.mp3',
      // 'sounds/game_over.mp3',
      // 'sounds/button_click.mp3',
    ];

    // Start loading assets
    this.loadAssets();
  }

  /**
   * Load assets
   */
  private async loadAssets(): Promise<void> {
    // Simulate asset loading (in production, use actual asset loading)
    const totalAssets = this.assetsToLoad.length;

    for (let i = 0; i < totalAssets; i++) {
      // Simulate loading time
      await this.delay(100);

      // Track loaded asset
      this.loadedAssets.push(this.assetsToLoad[i]);
      this.loadingProgress = (i + 1) / totalAssets;

      // Emit progress event
      this.emitProgress();
    }

    // Loading complete
    this.isLoaded = true;
    this.emitLoadComplete();
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Emit loading progress
   */
  private emitProgress(): void {
    // This would update a loading UI
    console.log(`Loading progress: ${Math.round(this.loadingProgress * 100)}%`);
  }

  /**
   * Emit load complete
   */
  private emitLoadComplete(): void {
    console.log('[BootScene] Asset loading complete!');

    // Call completion callback
    if (this.onLoadComplete) {
      console.log('[BootScene] Calling load complete callback...');
      this.onLoadComplete(this.scene);
    }
  }

  /**
   * Set load complete callback
   */
  setOnLoadComplete(callback: (scene: Scene) => void): void {
    this.onLoadComplete = callback;

    // If already loaded, call immediately
    if (this.isLoaded) {
      callback(this.scene);
    }
  }

  /**
   * Get loading progress (0-1)
   */
  getLoadingProgress(): number {
    return this.loadingProgress;
  }

  /**
   * Check if loading is complete
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Get loaded assets
   */
  getLoadedAssets(): string[] {
    return [...this.loadedAssets];
  }

  /**
   * Update boot scene
   * @param deltaTime Time since last frame in seconds
   */
  update(_deltaTime: number): void {
    // Boot scene doesn't need updates
    // Just waiting for assets to load
  }

  /**
   * Dispose boot scene
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    // Clear callbacks
    this.onLoadComplete = null;
    
    // Clear assets
    this.assetsToLoad = [];
    this.loadedAssets = [];
  }
}
