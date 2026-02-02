import { Scene, Color4, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, ActionManager, ExecuteCodeAction, InterpolateValueAction } from '@babylonjs/core';
import { GameMode } from '../types/game.types';
import { GameScene } from './GameScene';
import { eventBus } from '../utils/EventBus';

/**
 * Sandbox settings
 */
export interface SandboxSettings {
  startingBudget: number;
  trafficRps: number;
  trafficMix: {
    static: number;
    read: number;
    write: number;
    upload: number;
    search: number;
    malicious: number;
  };
  enableUpkeep: boolean;
  enableEvents: boolean;
}

/**
 * Default sandbox settings
 */
const DEFAULT_SANDBOX_SETTINGS: SandboxSettings = {
  startingBudget: 10000,
  trafficRps: 10,
  trafficMix: {
    static: 0.3,
    read: 0.25,
    write: 0.15,
    upload: 0.1,
    search: 0.2,
    malicious: 0.0,
  },
  enableUpkeep: false,
  enableEvents: false,
};

/**
 * SandboxScene - Sandbox mode with customizable settings
 */
export class SandboxScene {
  private scene: Scene;
  private isDisposed: boolean = false;

  // Sandbox settings
  private settings: SandboxSettings = { ...DEFAULT_SANDBOX_SETTINGS };

  // Game scene (reuses GameScene for gameplay)
  private gameScene: GameScene | null = null;

  // UI state
  private isSettingsOpen: boolean = false;

  // Callbacks
  private onBackToMenu: (() => void) | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupScene();
  }

  /**
   * Setup sandbox scene
   */
  private setupScene(): void {
    // Clear scene
    this.scene.clearColor = new Color4(0.1, 0.15, 0.2, 1);

    // Setup camera
    this.setupCamera();

    // Setup lighting
    this.setupLighting();

    // Create sandbox UI elements
    this.createSandboxUI();

    // Initialize game scene with sandbox mode
    this.initializeGameScene();
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const camera = new ArcRotateCamera(
      'sandboxCamera',
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
    light.intensity = 0.8;
  }

  /**
   * Create sandbox UI elements
   */
  private createSandboxUI(): void {
    // Create title
    this.createTitle();

    // Create settings panel
    this.createSettingsPanel();

    // Create action buttons
    this.createActionButtons();
  }

  /**
   * Create title
   */
  private createTitle(): void {
    console.log('Creating sandbox title: SANDBOX MODE');
  }

  /**
   * Create settings panel
   */
  private createSettingsPanel(): void {
    // Create settings panel background
    const panel = MeshBuilder.CreatePlane(
      'settings-panel',
      { width: 10, height: 8 },
      this.scene
    );
    panel.position = new Vector3(0, 0, -5);
    panel.rotation.x = Math.PI;

    const panelMaterial = new StandardMaterial('settings-panel-mat', this.scene);
    panelMaterial.diffuseColor = new Color3(0.1, 0.1, 0.15);
    panelMaterial.alpha = 0.95;
    panel.material = panelMaterial;

    // Create setting sliders
    this.createBudgetSlider(new Vector3(-3, 3, 0), this.settings.startingBudget);
    this.createRpsSlider(new Vector3(-3, 1.5, 0), this.settings.trafficRps);
    this.createToggle(new Vector3(-3, 0, 0), 'Enable Upkeep', this.settings.enableUpkeep);
    this.createToggle(new Vector3(-3, -1.5, 0), 'Enable Events', this.settings.enableEvents);

    // Create traffic mix sliders
    this.createTrafficMixSliders(new Vector3(3, 0, 0));
  }

  /**
   * Create budget slider
   */
  private createBudgetSlider(_position: Vector3, value: number): void {
    console.log(`Budget slider: $${value}`);
  }

  /**
   * Create RPS slider
   */
  private createRpsSlider(_position: Vector3, value: number): void {
    console.log(`RPS slider: ${value}`);
  }

  /**
   * Create toggle
   */
  private createToggle(_position: Vector3, label: string, enabled: boolean): void {
    console.log(`${label}: ${enabled}`);
  }

  /**
   * Create traffic mix sliders
   */
  private createTrafficMixSliders(_position: Vector3): void {
    const mix = this.settings.trafficMix;
    console.log('Traffic mix sliders:');
    console.log(`  Static: ${mix.static}`);
    console.log(`  Read: ${mix.read}`);
    console.log(`  Write: ${mix.write}`);
    console.log(`  Upload: ${mix.upload}`);
    console.log(`  Search: ${mix.search}`);
    console.log(`  Malicious: ${mix.malicious}`);
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    // Start sandbox button
    this.createButton(
      'Start Sandbox',
      new Vector3(0, -3.5, 0),
      () => this.startSandbox(),
      '#00ff00'
    );

    // Back to menu button
    this.createButton(
      'Back to Menu',
      new Vector3(0, -4.5, 0),
      () => this.handleBackToMenu(),
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
    const height = 0.6;
    const depth = 0.2;

    const mesh = MeshBuilder.CreateBox(
      `sandbox-button-${text}`,
      { width, height, depth },
      this.scene
    );
    mesh.position = position;

    const material = new StandardMaterial(`sandbox-button-mat-${text}`, this.scene);
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
   * Initialize game scene with sandbox mode
   */
  private initializeGameScene(): void {
    // GameScene will be created when user clicks "Start Sandbox"
    // For now, we just have the settings UI
  }

  /**
   * Start sandbox
   */
  private startSandbox(): void {
    console.log('Starting sandbox with settings:', this.settings);
    
    // Apply settings to game
    this.applySettings();
    
    // Emit event
    eventBus.emit('sandbox-start', { settings: this.settings });
    
    // Create game scene
    this.gameScene = new GameScene(this.scene, GameMode.SANDBOX);
    this.gameScene.start();
  }

  /**
   * Apply sandbox settings
   */
  private applySettings(): void {
    // Apply settings to the game scene
    if (this.gameScene) {
      const economySystem = this.gameScene.getEconomySystem();
      if (economySystem) {
        economySystem.setBudget(this.settings.startingBudget);
      }

      const trafficSystem = this.gameScene.getTrafficSystem();
      if (trafficSystem) {
        trafficSystem.setRps(this.settings.trafficRps);
        trafficSystem.setTrafficMix(this.settings.trafficMix);
      }
    }
  }

  /**
   * Handle back to menu
   */
  private handleBackToMenu(): void {
    console.log('Returning to main menu...');
    
    // Dispose game scene if active
    if (this.gameScene) {
      this.gameScene.dispose();
      this.gameScene = null;
    }
    
    // Emit event
    eventBus.emit('sandbox-menu', {});
    
    // Call callback
    if (this.onBackToMenu) {
      this.onBackToMenu();
    }
  }

  /**
   * Update sandbox scene
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    // Update game scene if active
    if (this.gameScene) {
      this.gameScene.update(deltaTime);
    }
  }

  /**
   * Set sandbox settings
   */
  setSettings(settings: Partial<SandboxSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get sandbox settings
   */
  getSettings(): SandboxSettings {
    return { ...this.settings };
  }

  /**
   * Set back to menu callback
   */
  setOnBackToMenu(callback: () => void): void {
    this.onBackToMenu = callback;
  }

  /**
   * Get game scene
   */
  getGameScene(): GameScene | null {
    return this.gameScene;
  }

  /**
   * Toggle settings panel
   */
  toggleSettingsPanel(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
    console.log(`Settings panel: ${this.isSettingsOpen ? 'open' : 'closed'}`);
  }

  /**
   * Dispose sandbox scene
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    // Dispose game scene
    if (this.gameScene) {
      this.gameScene.dispose();
      this.gameScene = null;
    }
    
    // Clear callbacks
    this.onBackToMenu = null;
    
    // Clear scene meshes
    this.scene.meshes.forEach((mesh: any) => {
      if (mesh.actionManager) {
        mesh.actionManager.dispose();
      }
    });
  }
}
