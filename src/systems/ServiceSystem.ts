import { Scene, Vector3 } from '@babylonjs/core';
import { eventBus } from '../utils/EventBus';
import { ServiceType, ServiceEntityData } from '../types/service.types';
import { SERVICES_CONFIG } from '../config/services.config';
import { GridSystem } from '../utils/GridSystem';

/**
 * ServiceSystem - Manages tower/service placement and attacks
 */
export class ServiceSystem {
  private scene: Scene;
  private grid: GridSystem;
  private services: Map<string, ServiceEntityData> = new Map();
  private activeServices: Map<string, { mesh: any; rangeMesh?: any }> = new Map();
  private selectedService: string | null = null;

  constructor(scene: Scene, grid: GridSystem) {
    this.scene = scene;
    this.grid = grid;

    // Subscribe to events
    eventBus.on('traffic-processed', () => {
      // Traffic was processed
    });

    eventBus.on('service-placed', ({ position, type }) => {
      this.placeService(position, type);
    });
  }

  /**
   * Update service system - called each frame
   */
  update(_deltaTime: number): void {
    const now = Date.now();

    // Update all services
    this.activeServices.forEach((_service, id) => {
      this.updateService(id, now);
    });
  }

  /**
   * Update individual service
   */
  private updateService(id: string, now: number): void {
    const service = this.activeServices.get(id);
    if (!service) return;

    const { mesh } = service;
    const data = this.services.get(id);
    if (!data) return;

    // Get level-specific config
    const levelConfig = data.config.levels[data.level - 1];

    // Check if can attack
    const timeSinceLastAttack = now - data.lastAttackTime;
    const attackInterval = 1000 / levelConfig.attackSpeed;

    if (timeSinceLastAttack >= attackInterval) {
      // Find targets in range
      const targets = this.grid.getEntitiesInRange(mesh.position, levelConfig.range);
      data.targets = targets;

      // Attack targets
      if (targets.length > 0) {
        this.attackTargets(id, targets);
        data.lastAttackTime = now;
      }
    }
  }

  /**
   * Attack traffic targets
   */
  private attackTargets(serviceId: string, targetIds: string[]): void {
    const service = this.services.get(serviceId);
    if (!service) return;

    // For now, just emit that traffic was processed
    // In a full implementation, this would:
    // 1. Find traffic entities by ID
    // 2. Apply damage based on service damage
    // 3. Check if traffic is destroyed
    // 4. Emit traffic-processed event

    targetIds.forEach(() => {
      eventBus.emit('traffic-processed', {
        type: service.config.type === ServiceType.FIREWALL ? 'malicious' as any : 'static' as any,
        reward: 10,
      });
    });
  }

  /**
   * Place a new service
   */
  placeService(position: Vector3, type: ServiceType): boolean {
    const config = SERVICES_CONFIG[type];
    const id = `service-${Date.now()}-${Math.random()}`;

    // Get grid position
    const gridPos = this.grid.worldToGrid(position);

    // Check if placement is valid
    if (!this.grid.isValidPlacement(gridPos)) {
      return false;
    }

    // Occupy cell
    if (!this.grid.occupyCell(gridPos, id)) {
      return false;
    }

    // Create service data
    const data: ServiceEntityData = {
      id,
      type,
      position: this.grid.snapToGrid(position),
      gridPosition: gridPos,
      level: 1,
      health: config.health,
      maxHealth: config.health,
      config: config,
      targets: [],
      lastAttackTime: 0,
    };

    this.services.set(id, data);

    // Create mesh
    const mesh = this.createServiceMesh(data);
    this.activeServices.set(id, { mesh });

    // Create range indicator
    const rangeMesh = this.createRangeMesh(data);
    if (rangeMesh) {
      this.activeServices.set(id, { mesh, rangeMesh });
    }

    // Emit event
    eventBus.emit('service-placed', { position: data.position, type });

    return true;
  }

  /**
   * Upgrade a service
   */
  upgradeService(id: string): boolean {
    const data = this.services.get(id);
    if (!data) return false;

    const config = SERVICES_CONFIG[data.type];
    const nextLevel = data.level + 1;

    if (nextLevel > config.levels.length) {
      return false; // Already max level
    }

    // Update data
    data.level = nextLevel;
    const levelConfig = config.levels[nextLevel - 1];
    data.health = levelConfig.health;
    data.maxHealth = levelConfig.maxHealth;

    // Update mesh
    const service = this.activeServices.get(id);
    if (service) {
      // Update range mesh
      if (service.rangeMesh) {
        service.rangeMesh.dispose();
      }
      const newRangeMesh = this.createRangeMesh(data);
      this.activeServices.set(id, {
        mesh: service.mesh,
        rangeMesh: newRangeMesh,
      });
    }

    // Emit event
    eventBus.emit('service-upgraded', { serviceId: id, newLevel: nextLevel });

    return true;
  }

  /**
   * Remove a service
   */
  removeService(id: string): boolean {
    const data = this.services.get(id);
    if (!data) return false;

    // Free cell
    this.grid.freeCell(data.gridPosition);

    // Dispose mesh
    const service = this.activeServices.get(id);
    if (service) {
      service.mesh.dispose();
      if (service.rangeMesh) {
        service.rangeMesh.dispose();
      }
    }

    // Remove from maps
    this.activeServices.delete(id);
    this.services.delete(id);

    // Emit event
    eventBus.emit('service-failed', { serviceId: id });

    return true;
  }

  /**
   * Create service mesh
   */
  private createServiceMesh(data: ServiceEntityData): any {
    const { MeshBuilder, StandardMaterial, Color3 } = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).BABYLON || require('@babylonjs/core');

    const size = 1.5;
    const height = 2;

    const mesh = MeshBuilder.CreateCylinder(
      `service-${data.id}`,
      { diameterTop: size, diameterBottom: size, height, tessellation: 6 },
      this.scene
    );
    mesh.position = data.position.clone();
    mesh.position.y = height / 2;

    const material = new StandardMaterial(`service-mat-${data.id}`, this.scene);
    material.diffuseColor = Color3.FromHexString(data.config.color);
    material.emissiveColor = Color3.FromHexString(data.config.color).scale(0.2);
    mesh.material = material;

    return mesh;
  }

  /**
   * Create range indicator mesh
   */
  private createRangeMesh(data: ServiceEntityData): any {
    const { MeshBuilder, StandardMaterial, Color3 } = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).BABYLON || require('@babylonjs/core');

    // Get level-specific config
    const levelConfig = data.config.levels[data.level - 1];

    const mesh = MeshBuilder.CreateDisc(
      `range-${data.id}`,
      { radius: levelConfig.range, tessellation: 32 },
      this.scene
    );
    mesh.position = data.position.clone();
    mesh.position.y = 0.1;
    mesh.rotation.x = Math.PI / 2;

    const material = new StandardMaterial(`range-mat-${data.id}`, this.scene);
    material.diffuseColor = Color3.FromHexString(data.config.color);
    material.alpha = 0.2;
    material.emissiveColor = Color3.FromHexString(data.config.color).scale(0.1);
    mesh.material = material;

    return mesh;
  }

  /**
   * Select a service
   */
  selectService(id: string): void {
    this.selectedService = id;
    const service = this.services.get(id);
    if (service) {
      eventBus.emit('service-selected', {
        serviceId: id,
        serviceType: service.type,
      });
    }
  }

  /**
   * Deselect current service
   */
  deselectService(): void {
    this.selectedService = null;
  }

  /**
   * Get service by ID
   */
  getService(id: string): ServiceEntityData | undefined {
    return this.services.get(id);
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceEntityData[] {
    return Array.from(this.services.values());
  }

  /**
   * Get selected service
   */
  getSelectedService(): ServiceEntityData | undefined {
    if (!this.selectedService) return undefined;
    return this.services.get(this.selectedService);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.activeServices.forEach((service) => {
      service.mesh.dispose();
      if (service.rangeMesh) {
        service.rangeMesh.dispose();
      }
    });
    this.activeServices.clear();
    this.services.clear();
    this.selectedService = null;
  }

  /**
   * Dispose system
   */
  dispose(): void {
    this.clear();
  }
}
