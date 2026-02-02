import { Scene, Vector3, Color3, HemisphericLight, DirectionalLight, ShadowGenerator, MeshBuilder, StandardMaterial } from '@babylonjs/core';
import { GameMode, GameResources, GameStats } from '../types/game.types';
import { ServiceType } from '../types/service.types';
import { CameraController } from '../managers/CameraController';
import { InputManager, InputEventType } from '../managers/InputManager';
import { GridSystem } from '../utils/GridSystem';
import { TrafficSystem } from '../systems/TrafficSystem';
import { ServiceSystem } from '../systems/ServiceSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { WaveSystem } from '../systems/WaveSystem';
import { HealthSystem } from '../systems/HealthSystem';
import { EventSystem } from '../systems/EventSystem';
import { eventBus } from '../utils/EventBus';
import { ParticleEntity, ParticleType } from '../entities/ParticleEntity';
import { GAME_CONFIG } from '../config/game.config';
import { SERVICES_CONFIG } from '../config/services.config';

/**
 * GameScene - Main gameplay scene integrating all game systems
 */
export class GameScene {
  private scene: Scene;
  private gameMode: GameMode;
  
  // Managers
  private cameraController: CameraController | null = null;
  private inputManager: InputManager | null = null;
  private gridSystem: GridSystem | null = null;
  
  // Game Systems
  private trafficSystem: TrafficSystem | null = null;
  private serviceSystem: ServiceSystem | null = null;
  private economySystem: EconomySystem | null = null;
  private waveSystem: WaveSystem | null = null;
  private healthSystem: HealthSystem | null = null;
  private eventSystem: EventSystem | null = null;
  
  // Visual effects
  private particles: Map<string, ParticleEntity> = new Map();
  
  // Game state
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private isInitialized: boolean = false;
  private isDisposed: boolean = false;

  // Lighting
  private light: HemisphericLight | null = null;
  private directionalLight: DirectionalLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;

  constructor(scene: Scene, gameMode: GameMode = GameMode.SURVIVAL) {
    this.scene = scene;
    this.gameMode = gameMode;
    
    this.setupScene();
  }

  /**
   * Setup the scene
   */
  private setupScene(): void {
    // Clear existing meshes
    this.scene.meshes.forEach(mesh => {
      if (mesh.name !== 'input-ground') {
        mesh.dispose();
      }
    });

    // Setup lighting
    this.setupLighting();

    // Setup ground
    this.setupGround();

    // Initialize managers
    this.initializeManagers();

    // Initialize game systems
    this.initializeSystems();

    // Setup event handlers
    this.setupEventHandlers();

    this.isInitialized = true;
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Hemispheric light for ambient illumination
    this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.7;
    this.light.diffuse = new Color3(1, 1, 1);
    this.light.groundColor = new Color3(0.5, 0.5, 0.5);

    // Directional light for shadows
    this.directionalLight = new DirectionalLight(
      'dirLight',
      new Vector3(-1, -2, -1),
      this.scene
    );
    this.directionalLight.intensity = 0.5;

    // Shadow generator
    this.shadowGenerator = new ShadowGenerator(1024, this.directionalLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
  }

  /**
   * Setup ground plane
   */
  private setupGround(): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 40, height: 40 },
      this.scene
    );

    const material = new StandardMaterial('ground-mat', this.scene);
    material.diffuseColor = new Color3(0.2, 0.2, 0.25);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = material;
    ground.receiveShadows = true;
  }

  /**
   * Initialize managers
   */
  private initializeManagers(): void {
    // Grid system
    this.gridSystem = new GridSystem(20, 20, 2);

    // Camera controller
    this.cameraController = new CameraController(this.scene, {
      radius: 30,
      beta: Math.PI / 3,
      target: Vector3.Zero(),
    });

    // Input manager
    this.inputManager = new InputManager(this.scene);
    this.setupInputHandlers();
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    if (!this.inputManager) return;

    // Handle clicks for service placement
    this.inputManager.on(InputEventType.CLICK, (event) => {
      this.handleClick(event);
    });

    // Handle double clicks for upgrades
    this.inputManager.on(InputEventType.DOUBLE_CLICK, (event) => {
      this.handleDoubleClick(event);
    });

    // Handle keyboard input
    this.inputManager.on(InputEventType.KEY_DOWN, (event) => {
      this.handleKeyDown(event);
    });
  }

  /**
   * Handle click event
   */
  private handleClick(event: any): void {
    if (this.isPaused || this.isGameOver) return;

    // Check if clicking on a service
    const service = this.findServiceAtPosition(event.position);
    if (service) {
      if (this.serviceSystem) {
        this.serviceSystem.selectService(service.id);
      }
    } else {
      // Place service if one is selected in build menu
      // This will be connected to UI build menu
      eventBus.emit('grid-clicked', { position: event.position });
    }
  }

  /**
   * Handle double click event
   */
  private handleDoubleClick(event: any): void {
    if (this.isPaused || this.isGameOver) return;

    // Upgrade service if double-clicked
    const service = this.findServiceAtPosition(event.position);
    if (service && this.serviceSystem) {
      this.serviceSystem.upgradeService(service.id);
      this.createParticleEffect(
        event.position,
        ParticleType.UPGRADE,
        '#00ff00'
      );
    }
  }

  /**
   * Handle key down event
   */
  private handleKeyDown(event: any): void {
    if (event.key === 'Escape') {
      this.togglePause();
    } else if (event.key === ' ') {
      this.togglePause();
    }
  }

  /**
   * Find service at position
   */
  private findServiceAtPosition(position: Vector3): any {
    if (!this.serviceSystem) return null;

    const services = this.serviceSystem.getAllServices();
    for (const service of services) {
      const distance = Vector3.Distance(service.position, position);
      if (distance < 2) {
        return service;
      }
    }
    return null;
  }

  /**
   * Initialize game systems
   */
  private initializeSystems(): void {
    // Traffic system
    this.trafficSystem = new TrafficSystem(this.scene, this.gridSystem!);

    // Service system
    this.serviceSystem = new ServiceSystem(this.scene, this.gridSystem!);

    // Economy system
    const config = this.gameMode === GameMode.SURVIVAL
      ? GAME_CONFIG.survival
      : GAME_CONFIG.sandbox;

    this.economySystem = new EconomySystem(
      this.gameMode,
      config.startingBudget,
      config.startingReputation
    );

    // Wave system
    this.waveSystem = new WaveSystem();

    // Health system
    this.healthSystem = new HealthSystem();

    // Event system
    this.eventSystem = new EventSystem();
  }

  /**
   * Setup event handlers for game events
   */
  private setupEventHandlers(): void {
    // Traffic processed
    eventBus.on('traffic-processed', ({ reward }) => {
      if (this.economySystem) {
        this.economySystem.addFunds(reward);
      }
    });

    // Traffic leaked
    eventBus.on('traffic-leaked', ({ damage }) => {
      if (this.economySystem) {
        this.economySystem.loseReputation(damage);
      }
    });

    // Service placed
    eventBus.on('service-placed', ({ position, type }) => {
      if (this.economySystem) {
        const cost = this.getServiceCost(type);
        this.economySystem.spendFunds(cost);
      }
      this.createParticleEffect(position, ParticleType.SPAWN, '#00ffff');
    });

    // Service upgraded
    eventBus.on('service-upgraded', ({ serviceId, newLevel }) => {
      if (this.economySystem) {
        // Calculate upgrade cost
        const cost = this.getUpgradeCost(serviceId, newLevel);
        this.economySystem.spendFunds(cost);
      }
    });

    // Service failed
    eventBus.on('service-failed', ({ serviceId }) => {
      if (this.healthSystem) {
        this.healthSystem.unregisterService(serviceId);
      }
    });

    // Wave started
    eventBus.on('wave-started', ({ rps }) => {
      if (this.trafficSystem) {
        this.trafficSystem.setRps(rps);
      }
    });

    // Game over
    eventBus.on('game-over', ({ reason }) => {
      this.handleGameOver(reason);
    });

    // Event triggered
    eventBus.on('event-triggered', ({ eventId }) => {
      this.handleRandomEvent(eventId);
    });
  }

  /**
   * Get service cost
   */
  private getServiceCost(type: ServiceType): number {
    return SERVICES_CONFIG[type]?.cost || 100;
  }

  /**
   * Get upgrade cost
   */
  private getUpgradeCost(serviceId: string, level: number): number {
    if (!this.serviceSystem) return 0;
    
    const service = this.serviceSystem.getService(serviceId);
    if (!service) return 0;
    
    const levelConfig = service.config.levels[level - 1];
    return levelConfig?.cost || 0;
  }

  /**
   * Handle random event
   */
  private handleRandomEvent(eventId: string): void {
    // Create visual effect for event
    const center = Vector3.Zero();
    const color = this.getEventColor(eventId);
    this.createParticleEffect(center, ParticleType.EXPLOSION, color);

    // Event is handled by individual systems
  }

  /**
   * Get event color
   */
  private getEventColor(eventId: string): string {
    switch (eventId) {
      case 'traffic-surge':
        return '#ffff00';
      case 'ddos-attack':
        return '#ff0000';
      case 'degradation':
        return '#ff8800';
      case 'budget-bonus':
        return '#00ff00';
      default:
        return '#ffffff';
    }
  }

  /**
   * Create particle effect
   */
  private createParticleEffect(
    position: Vector3,
    type: ParticleType,
    color: string
  ): void {
    const id = `particle-${Date.now()}-${Math.random()}`;
    const particle = new ParticleEntity(
      {
        type,
        position,
        color,
        size: 1,
        lifetime: 1,
      },
      this.scene
    );
    this.particles.set(id, particle);
  }

  /**
   * Update game scene
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    if (!this.isInitialized || this.isDisposed) return;
    if (this.isPaused || this.isGameOver) return;

    // Update all systems
    this.trafficSystem?.update(deltaTime);
    this.serviceSystem?.update(deltaTime);
    this.economySystem?.update(deltaTime);
    this.waveSystem?.update(deltaTime);
    this.healthSystem?.update(deltaTime);
    this.eventSystem?.update(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    const completedParticles: string[] = [];

    this.particles.forEach((particle, id) => {
      const isComplete = particle.update(deltaTime);
      if (isComplete) {
        completedParticles.push(id);
      }
    });

    // Remove completed particles
    completedParticles.forEach(id => {
      const particle = this.particles.get(id);
      if (particle) {
        particle.destroy();
        this.particles.delete(id);
      }
    });
  }

  /**
   * Start the game
   */
  start(): void {
    if (!this.isInitialized) return;

    this.isPaused = false;
    this.isGameOver = false;

    // Start wave system
    this.waveSystem?.start();
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.isPaused = true;
    eventBus.emit('game-paused', {});
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.isPaused = false;
    eventBus.emit('game-resumed', {});
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Handle game over
   */
  private handleGameOver(reason: string): void {
    this.isGameOver = true;
    const resources = this.economySystem?.getResources();
    const stats = this.economySystem?.getStats();
    const score = this.calculateFinalScore(resources, stats);
    eventBus.emit('game-over', { reason, score });
  }

  /**
   * Calculate final score
   */
  private calculateFinalScore(resources?: GameResources, stats?: GameStats): number {
    if (!resources || !stats) return 0;
    const timeBonus = Math.floor(stats.playTime / 10);
    const requestBonus = stats.requestsProcessed * 10;
    const attackBonus = stats.attacksBlocked * 50;
    const budgetBonus = Math.max(0, resources.budget);
    return timeBonus + requestBonus + attackBonus + budgetBonus;
  }

  /**
   * Restart the game
   */
  restart(): void {
    // Clear all systems
    this.trafficSystem?.clear();
    this.serviceSystem?.clear();
    this.healthSystem?.clear();

    // Reset economy
    this.economySystem?.reset();

    // Reset wave system
    this.waveSystem?.reset();

    // Clear particles
    this.particles.forEach(particle => particle.destroy());
    this.particles.clear();

    // Reset state
    this.isGameOver = false;
    this.isPaused = false;

    // Start game
    this.start();
  }

  /**
   * Get game statistics
   */
  getStats(): any {
    if (!this.economySystem) return null;
    return this.economySystem.getStats();
  }

  /**
   * Get current resources
   */
  getResources(): any {
    if (!this.economySystem) return null;
    return {
      budget: this.economySystem.getBudget(),
      reputation: this.economySystem.getReputation(),
    };
  }

  /**
   * Get camera controller
   */
  getCameraController(): CameraController | null {
    return this.cameraController;
  }

  /**
   * Get input manager
   */
  getInputManager(): InputManager | null {
    return this.inputManager;
  }

  /**
   * Get service system
   */
  getServiceSystem(): ServiceSystem | null {
    return this.serviceSystem;
  }

  /**
   * Get traffic system
   */
  getTrafficSystem(): TrafficSystem | null {
    return this.trafficSystem;
  }

  /**
   * Get economy system
   */
  getEconomySystem(): EconomySystem | null {
    return this.economySystem;
  }

  /**
   * Check if game is paused
   */
  isGamePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if game is over
   */
  isGameEnded(): boolean {
    return this.isGameOver;
  }

  /**
   * Dispose game scene
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;

    // Dispose systems
    this.trafficSystem?.dispose();
    this.serviceSystem?.dispose();
    this.healthSystem?.clear();
    this.eventSystem?.dispose();

    // Dispose managers
    this.cameraController?.dispose();
    this.inputManager?.dispose();

    // Dispose particles
    this.particles.forEach(particle => particle.destroy());
    this.particles.clear();

    // Dispose lighting
    this.light?.dispose();
    this.directionalLight?.dispose();
    this.shadowGenerator?.dispose();
  }
}
