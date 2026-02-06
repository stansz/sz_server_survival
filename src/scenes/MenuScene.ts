import { Scene, Color4, ArcRotateCamera, Vector3 } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Control, Button } from '@babylonjs/gui';
import { GameMode } from '../types/game.types';
import { eventBus } from '../utils/EventBus';

/**
 * MenuScene - Main menu with mode selection (Simple 2D GUI)
 */
export class MenuScene {
  private scene: Scene;
  private isDisposed: boolean = false;

  // Menu state
  private selectedMode: GameMode = GameMode.SURVIVAL;
  private isTransitioning: boolean = false;

  // GUI
  private guiTexture: AdvancedDynamicTexture | null = null;
  private guiButtons: Map<string, Button> = new Map();

  // Callbacks
  private onStartGame: ((mode: GameMode) => void) | null = null;
  private onShowSettings: (() => void) | null = null;
  private onShowCredits: (() => void) | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupScene();
  }

  /**
   * Setup menu scene
   */
  private setupScene(): void {
    console.log('[MenuScene] Setting up simple 2D menu...');

    // Clear scene
    this.scene.clearColor = new Color4(0.08, 0.1, 0.15, 1);

    // Setup camera (minimal 3D setup for GUI)
    this.setupCamera();

    // Initialize GUI
    this.setupGUI();

    // Create menu elements
    this.createMenuElements();

    console.log('[MenuScene] Simple 2D menu setup complete');
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const camera = new ArcRotateCamera(
      'menuCamera',
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
   * Setup GUI
   */
  private setupGUI(): void {
    // Create full-screen GUI texture
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('menuGUI', true, this.scene);
    console.log('[MenuScene] GUI texture created');
  }

  /**
   * Create menu elements
   */
  private createMenuElements(): void {
    console.log('[MenuScene] Creating menu elements...');

    // Create title
    this.createTitle();

    // Create game mode buttons
    this.createModeButtons();

    // Create additional menu buttons
    this.createMenuButtons();

    console.log('[MenuScene] Menu elements created');
  }

  /**
   * Create title
   */
  private createTitle(): void {
    if (!this.guiTexture) return;

    console.log('[MenuScene] Creating title: Server Survival');

    const title = new TextBlock();
    title.text = 'Server Survival';
    title.color = '#00d4ff';
    title.fontSize = '75vmin';
    title.fontFamily = 'Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    title.fontWeight = '900';
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    title.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    title.top = '5%';
    title.height = '20%';
    title.width = '100%';
    title.outlineWidth = 2;
    title.outlineColor = '#0066aa';

    console.log('[MenuScene] Title properties:', {
      text: title.text,
      fontSize: title.fontSize,
      top: title.top,
      height: title.height,
      width: title.width,
      horizontalAlignment: title.horizontalAlignment,
      textHorizontalAlignment: title.textHorizontalAlignment
    });

    this.guiTexture.addControl(title);
  }

  /**
   * Create mode selection buttons (directly start game on click)
   */
  private createModeButtons(): void {
    console.log('[MenuScene] Creating mode buttons...');

    // Survival mode button - directly starts game
    this.createButton(
      'Survival Mode',
      () => this.startGameWithMode(GameMode.SURVIVAL),
      '#00aaff',
      0
    );

    // Sandbox mode button - directly starts game
    this.createButton(
      'Sandbox Mode',
      () => this.startGameWithMode(GameMode.SANDBOX),
      '#00aaff',
      1
    );

    console.log('[MenuScene] Mode buttons created');
  }

  /**
   * Create menu buttons (Settings and Credits only - Start Game removed)
   */
  private createMenuButtons(): void {
    console.log('[MenuScene] Creating menu buttons...');

    // Settings button
    this.createButton(
      'Settings',
      () => this.handleSettings(),
      '#00aaff',
      2
    );

    // Credits button
    this.createButton(
      'Credits',
      () => this.handleCredits(),
      '#00aaff',
      3
    );

    console.log('[MenuScene] Menu buttons created');
  }

  /**
   * Create button
   */
  private createButton(
    text: string,
    onClick: () => void,
    color: string = '#00aaff',
    index: number
  ): void {
    if (!this.guiTexture) return;

    console.log(`[MenuScene] Creating button ${index}: "${text}"`);

    const button = Button.CreateSimpleButton(`button-${index}`, text);
    button.width = '24%';
    button.height = '8%';
    button.color = '#ffffff';
    button.fontSize = '27vmin';
    button.fontFamily = 'Arial, sans-serif';
    button.fontWeight = 'bold';
    button.background = color;
    button.cornerRadius = 15;
    button.thickness = 3;
    button.paddingTop = '0%';
    button.paddingBottom = '0%';

    button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    // Position buttons vertically from the top of the screen (simpler calculation)
    const baseTop = 30; // percentage
    const spacing = 10; // percentage
    button.top = `${baseTop + index * spacing}%`;

    console.log(`[MenuScene] Button "${text}" properties:`, {
      top: button.top,
      width: button.width,
      height: button.height,
      fontSize: button.fontSize
    });

    button.onPointerUpObservable.add(() => {
      console.log(`[MenuScene] Button "${text}" clicked!`);
      onClick();
    });

    button.onPointerEnterObservable.add(() => {
      button.background = this.lightenColor(color, 0.3);
    });

    button.onPointerOutObservable.add(() => {
      button.background = color;
    });

    this.guiTexture.addControl(button);
    this.guiButtons.set(text, button);

    console.log(`[MenuScene] Button "${text}" created`);
  }

  /**
   * Lighten a hex color
   */
  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + amount * 255));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + amount * 255));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + amount * 255));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  /**
   * Start game with specific mode (called directly from mode buttons)
   */
  private startGameWithMode(mode: GameMode): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.selectedMode = mode;
    console.log(`Starting game in ${mode} mode`);

    // Emit event
    eventBus.emit('game-start', { mode });

    // Call callback
    if (this.onStartGame) {
      this.onStartGame(mode);
    }
  }

  /**
   * Handle settings
   */
  private handleSettings(): void {
    console.log('Opening settings...');

    if (this.onShowSettings) {
      this.onShowSettings();
    }
  }

  /**
   * Handle credits
   */
  private handleCredits(): void {
    console.log('Opening credits...');

    if (this.onShowCredits) {
      this.onShowCredits();
    }
  }

  /**
   * Update menu scene
   * @param deltaTime Time since last frame in seconds
   */
  update(_deltaTime: number): void {
    // No updates needed for 2D menu
  }

  /**
   * Set start game callback
   */
  setOnStartGame(callback: (mode: GameMode) => void): void {
    this.onStartGame = callback;
  }

  /**
   * Set show settings callback
   */
  setOnShowSettings(callback: () => void): void {
    this.onShowSettings = callback;
  }

  /**
   * Set show credits callback
   */
  setOnShowCredits(callback: () => void): void {
    this.onShowCredits = callback;
  }

  /**
   * Get selected mode
   */
  getSelectedMode(): GameMode {
    return this.selectedMode;
  }

  /**
   * Dispose menu scene
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    console.log('[MenuScene] Disposing menu...');

    // Clear callbacks
    this.onStartGame = null;
    this.onShowSettings = null;
    this.onShowCredits = null;

    // Dispose GUI buttons
    this.guiButtons.forEach((button) => {
      button.dispose();
    });
    this.guiButtons.clear();

    // Dispose GUI texture
    if (this.guiTexture) {
      this.guiTexture.dispose();
      this.guiTexture = null;
    }

    console.log('[MenuScene] Menu disposed');
  }
}
