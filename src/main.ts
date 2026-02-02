import { Engine, Scene } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/gui';
import { GameMode, GameState } from './types/game.types';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene, GameStats } from './scenes/GameOverScene';
import { SandboxScene } from './scenes/SandboxScene';
import { eventBus } from './utils/EventBus';

/**
 * Scene manager for handling scene transitions
 */
class SceneManager {
  private engine: Engine;
  private currentScene: any = null;
  private previousScene: any = null;
  private isTransitioning: boolean = false;

  // Scenes
  private bootScene: BootScene | null = null;
  private menuScene: MenuScene | null = null;
  private gameScene: GameScene | null = null;
  private pauseScene: PauseScene | null = null;
  private gameOverScene: GameOverScene | null = null;
  private sandboxScene: SandboxScene | null = null;

  // Game state
  private currentGameMode: GameMode = GameMode.SURVIVAL;
  private currentGameState: GameState = GameState.BOOT;

  constructor(engine: Engine) {
    this.engine = engine;

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for scene transitions
   */
  private setupEventHandlers(): void {
    // Boot scene complete
    eventBus.on('boot-complete', () => {
      this.transitionToMenu();
    });

    // Game start
    eventBus.on('game-start', ({ mode }) => {
      this.transitionToGame(mode as any);
    });

    // Game paused
    eventBus.on('game-paused', () => {
      this.transitionToPause();
    });

    // Game resumed
    eventBus.on('game-resumed', () => {
      this.resumeGame();
    });

    // Pause menu actions
    eventBus.on('pause-resume', () => {
      this.resumeGame();
    });

    eventBus.on('pause-restart', () => {
      this.restartGame();
    });

    eventBus.on('pause-quit', () => {
      this.transitionToMenu();
    });

    // Game over
    eventBus.on('game-over', ({ reason }: { reason: string; score?: number }) => {
      this.transitionToGameOver(reason);
    });

    // Game over actions
    eventBus.on('gameover-restart', () => {
      this.restartGame();
    });

    eventBus.on('gameover-menu', () => {
      this.transitionToMenu();
    });

    // Sandbox actions
    eventBus.on('sandbox-start', ({ settings }) => {
      this.startSandbox(settings);
    });

    eventBus.on('sandbox-menu', () => {
      this.transitionToMenu();
    });
  }

  /**
   * Start with boot scene
   */
  start(): void {
    this.transitionToBoot();
  }

  /**
   * Transition to boot scene
   */
  private transitionToBoot(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    console.log('[SceneManager] Transitioning to BOOT scene...');

    // Clear current scene
    this.clearCurrentScene();

    // Create boot scene
    const scene = new Scene(this.engine);
    this.bootScene = new BootScene(scene);
    this.currentScene = this.bootScene;
    this.currentGameState = GameState.BOOT;

    console.log('[SceneManager] BootScene created, waiting for asset loading...');

    // Set load complete callback
    this.bootScene.setOnLoadComplete(() => {
      console.log('[SceneManager] Boot complete, transitioning to menu...');
      eventBus.emit('boot-complete', {});
    });

    this.isTransitioning = false;
  }

  /**
   * Transition to menu scene
   */
  private transitionToMenu(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    console.log('[SceneManager] Transitioning to MENU scene...');

    // Clear current scene
    this.clearCurrentScene();

    // Create menu scene
    const scene = new Scene(this.engine);
    this.menuScene = new MenuScene(scene);
    this.currentScene = this.menuScene;
    this.currentGameState = GameState.MENU;

    console.log('[SceneManager] MenuScene created with', scene.meshes.length, 'meshes');

    // Set callbacks
    this.menuScene.setOnStartGame((mode) => {
      this.currentGameMode = mode;
      console.log('[SceneManager] Starting game in mode:', mode);
      eventBus.emit('game-start', { mode });
    });

    this.menuScene.setOnShowSettings(() => {
      console.log('[SceneManager] Settings not implemented yet');
    });

    this.menuScene.setOnShowCredits(() => {
      console.log('[SceneManager] Credits not implemented yet');
    });

    this.isTransitioning = false;
  }

  /**
   * Transition to game scene
   */
  private transitionToGame(mode: GameMode | string): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clear current scene
    this.clearCurrentScene();

    // Create game scene
    const scene = new Scene(this.engine);
    this.gameScene = new GameScene(scene, mode as any);
    this.currentScene = this.gameScene;
    this.currentGameState = GameState.GAME;
    this.currentGameMode = mode as any;

    // Start game
    this.gameScene.start();

    this.isTransitioning = false;
  }

  /**
   * Transition to pause scene
   */
  private transitionToPause(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Store previous scene
    this.previousScene = this.currentScene;

    // Create pause scene
    const scene = new Scene(this.engine);
    this.pauseScene = new PauseScene(scene);
    this.currentScene = this.pauseScene;
    this.currentGameState = GameState.PAUSE;

    // Set callbacks
    this.pauseScene.setOnResume(() => {
      eventBus.emit('pause-resume', {});
    });

    this.pauseScene.setOnRestart(() => {
      eventBus.emit('pause-restart', {});
    });

    this.pauseScene.setOnQuit(() => {
      eventBus.emit('pause-quit', {});
    });

    this.isTransitioning = false;
  }

  /**
   * Resume game from pause
   */
  private resumeGame(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clear pause scene
    if (this.pauseScene) {
      this.pauseScene.dispose();
      this.pauseScene = null;
    }

    // Restore previous scene
    this.currentScene = this.previousScene;
    this.currentGameState = GameState.GAME;

    // Resume game
    if (this.gameScene) {
      this.gameScene.resume();
    }

    this.isTransitioning = false;
  }

  /**
   * Restart game
   */
  private restartGame(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clear all scenes
    this.clearAllScenes();

    // Create new game scene
    const scene = new Scene(this.engine);
    this.gameScene = new GameScene(scene, this.currentGameMode);
    this.currentScene = this.gameScene;
    this.currentGameState = GameState.GAME;

    // Start game
    this.gameScene.start();

    this.isTransitioning = false;
  }

  /**
   * Transition to game over scene
   */
  private transitionToGameOver(reason: string): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Get game stats before clearing
    const stats = this.getGameStats();

    // Clear current scene
    this.clearCurrentScene();

    // Create game over scene
    const scene = new Scene(this.engine);
    this.gameOverScene = new GameOverScene(scene);
    this.currentScene = this.gameOverScene;
    this.currentGameState = GameState.GAME_OVER;

    // Set game over data
    this.gameOverScene.setGameOverData(reason as any, stats);

    // Set callbacks
    this.gameOverScene.setOnRestart(() => {
      eventBus.emit('gameover-restart', {});
    });

    this.gameOverScene.setOnMenu(() => {
      eventBus.emit('gameover-menu', {});
    });

    this.isTransitioning = false;
  }

  /**
   * Start sandbox mode
   */
  private startSandbox(settings: any): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clear current scene
    this.clearCurrentScene();

    // Create sandbox scene
    const scene = new Scene(this.engine);
    this.sandboxScene = new SandboxScene(scene);
    this.currentScene = this.sandboxScene;
    this.currentGameState = GameState.GAME;
    this.currentGameMode = GameMode.SANDBOX;

    // Apply settings
    this.sandboxScene.setSettings(settings);

    // Set callback
    this.sandboxScene.setOnBackToMenu(() => {
      eventBus.emit('sandbox-menu', {});
    });

    this.isTransitioning = false;
  }

  /**
   * Get game stats
   */
  private getGameStats(): GameStats {
    if (!this.gameScene) {
      return {
        playTime: 0,
        wavesCompleted: 0,
        requestsProcessed: 0,
        attacksBlocked: 0,
        servicesBuilt: 0,
        budget: 0,
        reputation: 0,
      };
    }

    const stats = this.gameScene.getStats();
    const resources = this.gameScene.getResources();

    return {
      playTime: stats?.playTime || 0,
      wavesCompleted: stats?.wavesCompleted || 0,
      requestsProcessed: stats?.requestsProcessed || 0,
      attacksBlocked: stats?.attacksBlocked || 0,
      servicesBuilt: stats?.servicesBuilt || 0,
      budget: resources?.budget || 0,
      reputation: resources?.reputation || 0,
    };
  }

  /**
   * Clear current scene
   */
  private clearCurrentScene(): void {
    if (this.currentScene) {
      this.currentScene.dispose();
      this.currentScene = null;
    }
  }

  /**
   * Clear all scenes
   */
  private clearAllScenes(): void {
    this.bootScene?.dispose();
    this.bootScene = null;

    this.menuScene?.dispose();
    this.menuScene = null;

    this.gameScene?.dispose();
    this.gameScene = null;

    this.pauseScene?.dispose();
    this.pauseScene = null;

    this.gameOverScene?.dispose();
    this.gameOverScene = null;

    this.sandboxScene?.dispose();
    this.sandboxScene = null;

    this.currentScene = null;
    this.previousScene = null;
  }

  /**
   * Update current scene
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Get current game state
   */
  getCurrentGameState(): GameState {
    return this.currentGameState;
  }

  /**
   * Get current game mode
   */
  getCurrentGameMode(): GameMode {
    return this.currentGameMode;
  }

  /**
   * Get current scene
   */
  getCurrentScene(): any {
    return this.currentScene;
  }

  /**
   * Dispose scene manager
   */
  dispose(): void {
    this.clearAllScenes();
  }
}

/**
 * Main application entry point
 */
class ServerSurvival {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private sceneManager: SceneManager | null = null;
  private lastTime: number = 0;

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
    console.log('[ServerSurvival] Initializing...');

    // Initialize scene manager
    this.sceneManager = new SceneManager(this.engine);

    // Start with boot scene
    console.log('[ServerSurvival] Starting scene manager...');
    this.sceneManager.start();

    // Start the render loop
    this.lastTime = performance.now();
    this.engine.runRenderLoop(() => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
      this.lastTime = currentTime;

      // Update scene manager
      this.sceneManager?.update(deltaTime);

      // Render all active scenes
      this.engine.scenes.forEach((scene) => {
        scene.render();
      });
    });

    console.log('[ServerSurvival] Render loop started');
  }

  dispose(): void {
    this.sceneManager?.dispose();
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
export { ServerSurvival, SceneManager };
