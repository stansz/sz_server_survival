import { Scene, Color4, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, ActionManager, ExecuteCodeAction, InterpolateValueAction } from '@babylonjs/core';
import { eventBus } from '../utils/EventBus';

/**
 * Game over reason
 */
export enum GameOverReason {
  REPUTATION = 'reputation',
  BANKRUPTCY = 'bankruptcy',
  USER_QUIT = 'user_quit',
}

/**
 * Game statistics for display
 */
export interface GameStats {
  playTime: number;
  wavesCompleted: number;
  requestsProcessed: number;
  attacksBlocked: number;
  servicesBuilt: number;
  budget: number;
  reputation: number;
}

/**
 * GameOverScene - Game over screen with score display
 */
export class GameOverScene {
  private scene: Scene;
  private isDisposed: boolean = false;

  // Game data
  private reason: GameOverReason = GameOverReason.REPUTATION;
  private stats: GameStats | null = null;

  // Callbacks
  private onRestart: (() => void) | null = null;
  private onMenu: (() => void) | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupScene();
  }

  /**
   * Setup game over scene
   */
  private setupScene(): void {
    // Clear scene
    this.scene.clearColor = new Color4(0.1, 0.05, 0.05, 1);

    // Setup camera
    this.setupCamera();

    // Setup lighting
    this.setupLighting();

    // Create game over elements
    this.createGameOverElements();
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const camera = new ArcRotateCamera(
      'gameOverCamera',
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
   * Create game over elements
   */
  private createGameOverElements(): void {
    // Create title
    this.createTitle();

    // Create game over reason
    this.createReasonDisplay();

    // Create statistics display
    this.createStatsDisplay();

    // Create action buttons
    this.createActionButtons();

    // Create background decoration
    this.createBackgroundDecoration();
  }

  /**
   * Create title
   */
  private createTitle(): void {
    // Create "GAME OVER" text using boxes
    const text = 'GAME OVER';
    const letterWidth = 1.2;
    const letterHeight = 2;
    const letterDepth = 0.3;
    const spacing = 0.2;

    let xOffset = -((text.length * (letterWidth + spacing)) / 2);

    for (let i = 0; i < text.length; i++) {
      const letter = MeshBuilder.CreateBox(
        `title-letter-${i}`,
        { width: letterWidth, height: letterHeight, depth: letterDepth },
        this.scene
      );
      letter.position = new Vector3(xOffset, 4, 0);

      const material = new StandardMaterial(`title-mat-${i}`, this.scene);
      material.diffuseColor = Color3.FromHexString('#ff0000');
      material.emissiveColor = Color3.FromHexString('#ff0000').scale(0.5);
      letter.material = material;

      xOffset += letterWidth + spacing;
    }
  }

  /**
   * Create reason display
   */
  private createReasonDisplay(): void {
    const reasonText = this.getReasonText();
    console.log(`Game over reason: ${reasonText}`);

    // In a full implementation, this would display the reason text
  }

  /**
   * Get reason text
   */
  private getReasonText(): string {
    switch (this.reason) {
      case GameOverReason.REPUTATION:
        return 'Your reputation reached 0%. The customers have lost faith in your infrastructure.';
      case GameOverReason.BANKRUPTCY:
        return 'You went bankrupt. Your budget dropped below -$1000.';
      case GameOverReason.USER_QUIT:
        return 'You quit the game.';
      default:
        return 'Game over.';
    }
  }

  /**
   * Create statistics display
   */
  private createStatsDisplay(): void {
    if (!this.stats) return;

    const stats = this.stats;
    const startY = 2;
    const spacing = 0.8;

    // Create stat labels
    this.createStatLabel('Play Time', this.formatTime(stats.playTime), new Vector3(-4, startY, 0));
    this.createStatLabel('Waves Completed', stats.wavesCompleted.toString(), new Vector3(-4, startY - spacing, 0));
    this.createStatLabel('Requests Processed', stats.requestsProcessed.toString(), new Vector3(-4, startY - spacing * 2, 0));
    this.createStatLabel('Attacks Blocked', stats.attacksBlocked.toString(), new Vector3(-4, startY - spacing * 3, 0));
    this.createStatLabel('Services Built', stats.servicesBuilt.toString(), new Vector3(-4, startY - spacing * 4, 0));
    this.createStatLabel('Final Budget', `$${stats.budget.toFixed(0)}`, new Vector3(-4, startY - spacing * 5, 0));
    this.createStatLabel('Final Reputation', `${stats.reputation.toFixed(0)}%`, new Vector3(-4, startY - spacing * 6, 0));
  }

  /**
   * Create stat label
   */
  private createStatLabel(label: string, _value: string, position: Vector3): void {
    // Create label box
    const labelMesh = MeshBuilder.CreateBox(
      `stat-label-${label}`,
      { width: 3.5, height: 0.4, depth: 0.1 },
      this.scene
    );
    labelMesh.position = position;

    const labelMaterial = new StandardMaterial(`stat-label-mat-${label}`, this.scene);
    labelMaterial.diffuseColor = Color3.FromHexString('#888888');
    labelMaterial.alpha = 0.5;
    labelMesh.material = labelMaterial;

    // Create value box
    const valueMesh = MeshBuilder.CreateBox(
      `stat-value-${label}`,
      { width: 2, height: 0.4, depth: 0.1 },
      this.scene
    );
    valueMesh.position = new Vector3(position.x + 4, position.y, position.z);

    const valueMaterial = new StandardMaterial(`stat-value-mat-${label}`, this.scene);
    valueMaterial.diffuseColor = Color3.FromHexString('#00ff00');
    valueMaterial.alpha = 0.8;
    valueMesh.material = valueMaterial;
  }

  /**
   * Format time
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    // Restart button
    this.createButton(
      'Play Again',
      new Vector3(-2, -2, 0),
      () => this.handleRestart(),
      '#00ff00'
    );

    // Menu button
    this.createButton(
      'Main Menu',
      new Vector3(2, -2, 0),
      () => this.handleMenu(),
      '#00aaff'
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
    const width = 3.5;
    const height = 0.8;
    const depth = 0.2;

    const mesh = MeshBuilder.CreateBox(
      `gameover-button-${text}`,
      { width, height, depth },
      this.scene
    );
    mesh.position = position;

    const material = new StandardMaterial(`gameover-button-mat-${text}`, this.scene);
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
   * Create background decoration
   */
  private createBackgroundDecoration(): void {
    // Create falling particles
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 0.3 + 0.1;
      const mesh = MeshBuilder.CreateBox(
        `gameover-deco-${i}`,
        { size },
        this.scene
      );

      mesh.position = new Vector3(
        (Math.random() - 0.5) * 40,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 40
      );

      const material = new StandardMaterial(`gameover-deco-mat-${i}`, this.scene);
      material.diffuseColor = Color3.FromHexString('#ff4444');
      material.emissiveColor = Color3.FromHexString('#ff4444').scale(0.3);
      material.alpha = 0.3;
      mesh.material = material;

      // Store fall speed for animation
      // @ts-ignore
      mesh.fallSpeed = Math.random() * 0.05 + 0.02;
    }
  }

  /**
   * Set game over data
   */
  setGameOverData(reason: GameOverReason, stats: GameStats & { score?: number }): void {
    this.reason = reason;
    this.stats = stats;
  }

  /**
   * Handle restart
   */
  private handleRestart(): void {
    console.log('Restarting game...');
    
    // Emit event
    eventBus.emit('gameover-restart', {});
    
    // Call callback
    if (this.onRestart) {
      this.onRestart();
    }
  }

  /**
   * Handle menu
   */
  private handleMenu(): void {
    console.log('Returning to main menu...');
    
    // Emit event
    eventBus.emit('gameover-menu', {});
    
    // Call callback
    if (this.onMenu) {
      this.onMenu();
    }
  }

  /**
   * Update game over scene
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    // Animate background decoration
    this.scene.meshes.forEach((mesh: any) => {
      if (mesh.name.startsWith('gameover-deco-') && mesh.fallSpeed) {
        mesh.position.y -= mesh.fallSpeed * deltaTime * 60;
        
        // Reset if below ground
        if (mesh.position.y < -5) {
          mesh.position.y = 20;
        }
      }
    });
  }

  /**
   * Set restart callback
   */
  setOnRestart(callback: () => void): void {
    this.onRestart = callback;
  }

  /**
   * Set menu callback
   */
  setOnMenu(callback: () => void): void {
    this.onMenu = callback;
  }

  /**
   * Dispose game over scene
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    // Clear callbacks
    this.onRestart = null;
    this.onMenu = null;
    
    // Clear scene meshes
    this.scene.meshes.forEach((mesh: any) => {
      if (mesh.actionManager) {
        mesh.actionManager.dispose();
      }
    });
  }
}
