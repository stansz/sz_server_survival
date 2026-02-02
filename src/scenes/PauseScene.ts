import { Scene, Color4, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, ActionManager, ExecuteCodeAction, InterpolateValueAction } from '@babylonjs/core';
import { eventBus } from '../utils/EventBus';

/**
 * PauseScene - Pause menu
 */
export class PauseScene {
  private scene: Scene;
  private isDisposed: boolean = false;

  // Callbacks
  private onResume: (() => void) | null = null;
  private onRestart: (() => void) | null = null;
  private onQuit: (() => void) | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupScene();
  }

  /**
   * Setup pause scene
   */
  private setupScene(): void {
    // Clear scene
    this.scene.clearColor = new Color4(0.05, 0.05, 0.1, 0.9);

    // Setup camera
    this.setupCamera();

    // Setup lighting
    this.setupLighting();

    // Create pause menu elements
    this.createPauseElements();
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const camera = new ArcRotateCamera(
      'pauseCamera',
      -Math.PI / 2,
      Math.PI / 2.5,
      15,
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
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.6;
  }

  /**
   * Create pause menu elements
   */
  private createPauseElements(): void {
    // Create title
    this.createTitle();

    // Create pause menu buttons
    this.createPauseButtons();

    // Create background overlay
    this.createBackgroundOverlay();
  }

  /**
   * Create title
   */
  private createTitle(): void {
    // In a full implementation, this would use Babylon.GUI
    console.log('Creating pause title: PAUSED');
  }

  /**
   * Create pause menu buttons
   */
  private createPauseButtons(): void {
    // Resume button
    this.createButton(
      'Resume',
      new Vector3(0, 2, 0),
      () => this.handleResume(),
      '#00ff00'
    );

    // Restart button
    this.createButton(
      'Restart',
      new Vector3(0, 0, 0),
      () => this.handleRestart(),
      '#ffaa00'
    );

    // Quit button
    this.createButton(
      'Quit to Menu',
      new Vector3(0, -2, 0),
      () => this.handleQuit(),
      '#ff4444'
    );
  }

  /**
   * Create button
   */
  private createButton(
    text: string,
    position: Vector3,
    onClick: () => void,
    color: string = '#00aaff'
  ): void {
    const width = 4;
    const height = 0.8;
    const depth = 0.2;

    const mesh = MeshBuilder.CreateBox(
      `pause-button-${text}`,
      { width, height, depth },
      this.scene
    );
    mesh.position = position;

    const material = new StandardMaterial(`pause-button-mat-${text}`, this.scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.emissiveColor = Color3.FromHexString(color).scale(0.3);
    material.alpha = 0.9;
    mesh.material = material;

    // Add click handler
    mesh.actionManager = new ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickTrigger,
        () => {
          onClick();
          this.flashButton(mesh, material);
        }
      )
    );

    // Add hover effect
    mesh.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPointerOverTrigger,
        material,
        'emissiveColor',
        Color3.FromHexString(color).scale(0.6),
        150
      )
    );

    mesh.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPointerOutTrigger,
        material,
        'emissiveColor',
        Color3.FromHexString(color).scale(0.3),
        150
      )
    );
  }

  /**
   * Flash button on click
   */
  private flashButton(_mesh: any, material: any): void {
    const originalColor = material.emissiveColor.clone();
    material.emissiveColor = new Color3(1, 1, 1);

    setTimeout(() => {
      material.emissiveColor = originalColor;
    }, 100);
  }

  /**
   * Create background overlay
   */
  private createBackgroundOverlay(): void {
    const overlay = MeshBuilder.CreatePlane(
      'pause-overlay',
      { width: 50, height: 30 },
      this.scene
    );
    overlay.position = new Vector3(0, 0, -5);
    overlay.rotation.x = Math.PI;

    const material = new StandardMaterial('pause-overlay-mat', this.scene);
    material.diffuseColor = new Color3(0, 0, 0);
    material.alpha = 0.7;
    overlay.material = material;
  }

  /**
   * Handle resume
   */
  private handleResume(): void {
    console.log('Resuming game...');
    
    // Emit event
    eventBus.emit('pause-resume', {});
    
    // Call callback
    if (this.onResume) {
      this.onResume();
    }
  }

  /**
   * Handle restart
   */
  private handleRestart(): void {
    console.log('Restarting game...');
    
    // Emit event
    eventBus.emit('pause-restart', {});
    
    // Call callback
    if (this.onRestart) {
      this.onRestart();
    }
  }

  /**
   * Handle quit
   */
  private handleQuit(): void {
    console.log('Quitting to menu...');
    
    // Emit event
    eventBus.emit('pause-quit', {});
    
    // Call callback
    if (this.onQuit) {
      this.onQuit();
    }
  }

  /**
   * Update pause scene
   * @param deltaTime Time since last frame in seconds
   */
  update(_deltaTime: number): void {
    // Pause scene doesn't need updates
    // Just waiting for user input
  }

  /**
   * Set resume callback
   */
  setOnResume(callback: () => void): void {
    this.onResume = callback;
  }

  /**
   * Set restart callback
   */
  setOnRestart(callback: () => void): void {
    this.onRestart = callback;
  }

  /**
   * Set quit callback
   */
  setOnQuit(callback: () => void): void {
    this.onQuit = callback;
  }

  /**
   * Dispose pause scene
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    // Clear callbacks
    this.onResume = null;
    this.onRestart = null;
    this.onQuit = null;

    // Clear scene meshes
    this.scene.meshes.forEach((mesh: any) => {
      if (mesh.actionManager) {
        mesh.actionManager.dispose();
      }
    });
  }
}
