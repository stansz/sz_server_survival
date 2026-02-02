import { Scene, Vector3 } from '@babylonjs/core';
import { eventBus } from '../utils/EventBus';
import { TrafficType, TrafficEntityData } from '../types/traffic.types';
import { TRAFFIC_CONFIG } from '../config/traffic.config';
import { GridSystem } from '../utils/GridSystem';

  /**
   * TrafficSystem - Manages enemy traffic spawning and movement
   */
export class TrafficSystem {
  private scene: Scene;
  private grid: GridSystem;
  private trafficEntities: Map<string, TrafficEntityData> = new Map();
  private activeTraffic: Map<string, { mesh: any; data: TrafficEntityData }> = new Map();
  private spawnTimer: number = 0;
  private rps: number = 5; // Requests per second
  private trafficMix: {
    static: number;
    read: number;
    write: number;
    upload: number;
    search: number;
    malicious: number;
  } = {
    static: 0.3,
    read: 0.25,
    write: 0.15,
    upload: 0.1,
    search: 0.2,
    malicious: 0.0,
  };

  constructor(scene: Scene, grid: GridSystem) {
    this.scene = scene;
    this.grid = grid;

  // Subscribe to events
  eventBus.on('wave-started', ({ rps }) => {
    this.rps = rps;
  });

    eventBus.on('event-triggered', ({ eventId, duration }) => {
      this.handleEvent(eventId, duration);
    });
  }

  /**
   * Update traffic system - called each frame
   */
  update(deltaTime: number): void {
    // Spawn traffic based on RPS
    this.spawnTimer += deltaTime;
    const spawnInterval = 1 / this.rps;

    while (this.spawnTimer >= spawnInterval) {
      this.spawnTraffic();
      this.spawnTimer -= spawnInterval;
    }

    // Update all traffic entities
    this.activeTraffic.forEach((_entity, id) => {
      this.updateTrafficEntity(id, deltaTime);
    });
  }

  /**
   * Spawn a new traffic entity
   */
  private spawnTraffic(): void {
    const type = this.getRandomTrafficType();
    const config = TRAFFIC_CONFIG[type];
    const id = `traffic-${Date.now()}-${Math.random()}`;

    // Get spawn position (edge of grid)
    const spawnPos = this.getSpawnPosition();
    const targetPos = this.getTargetPosition();
    const path = this.grid.findPath(
      this.grid.worldToGrid(spawnPos),
      this.grid.worldToGrid(targetPos)
    );

    const data: TrafficEntityData = {
      id,
      type,
      position: spawnPos,
      path,
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      config,
    };

    this.trafficEntities.set(id, data);

    // Create mesh
    const mesh = this.createTrafficMesh(data);
    this.activeTraffic.set(id, { mesh, data });
  }

  /**
   * Get random traffic type based on mix ratios
   */
  private getRandomTrafficType(): TrafficType {
    const random = Math.random();
    let cumulative = 0;

    if (random < (cumulative += this.trafficMix.static)) return TrafficType.STATIC;
    if (random < (cumulative += this.trafficMix.read)) return TrafficType.READ;
    if (random < (cumulative += this.trafficMix.write)) return TrafficType.WRITE;
    if (random < (cumulative += this.trafficMix.upload)) return TrafficType.UPLOAD;
    if (random < (cumulative += this.trafficMix.search)) return TrafficType.SEARCH;
    return TrafficType.MALICIOUS;
  }

  /**
   * Get spawn position at edge of grid
   */
  private getSpawnPosition(): Vector3 {
    const side = Math.floor(Math.random() * 4);
    const offset = 15;

    switch (side) {
      case 0: // Top
        return new Vector3(Math.random() * 20 - 10, 0, -offset);
      case 1: // Right
        return new Vector3(offset, 0, Math.random() * 20 - 10);
      case 2: // Bottom
        return new Vector3(Math.random() * 20 - 10, 0, offset);
      case 3: // Left
        return new Vector3(-offset, 0, Math.random() * 20 - 10);
      default:
        return Vector3.Zero();
    }
  }

  /**
   * Get target position (center of grid)
   */
  private getTargetPosition(): Vector3 {
    return Vector3.Zero();
  }

  /**
   * Create traffic mesh
   */
  private createTrafficMesh(data: TrafficEntityData): any {
    const { MeshBuilder, StandardMaterial, Color3 } = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).BABYLON || require('@babylonjs/core');

    const size = 0.5;
    const mesh = MeshBuilder.CreateBox(`traffic-${data.id}`, { size }, this.scene);
    mesh.position = data.position.clone();
    mesh.position.y = size / 2;

    const material = new StandardMaterial(`traffic-mat-${data.id}`, this.scene);
    material.diffuseColor = Color3.FromHexString(data.config.color);
    material.emissiveColor = Color3.FromHexString(data.config.color).scale(0.3);
    mesh.material = material;

    return mesh;
  }

  /**
   * Update traffic entity position and state
   */
  private updateTrafficEntity(id: string, deltaTime: number): void {
    const entity = this.activeTraffic.get(id);
    if (!entity) return;

    const { mesh, data } = entity;

    // Move along path
    if (data.path.length > 0) {
      const nextPos = data.path[0];
      const direction = nextPos.subtract(mesh.position);
      const distance = direction.length();

      if (distance < 0.1) {
        // Reached waypoint, remove it
        data.path.shift();
      } else {
        // Move towards waypoint
        const moveDir = direction.normalize();
        const moveSpeed = data.speed * deltaTime * 2;
        mesh.position.addInPlace(moveDir.scale(moveSpeed));
        data.position = mesh.position.clone();
      }
    } else {
      // Reached destination
      this.handleTrafficLeaked(id);
    }
  }

  /**
   * Handle traffic that leaked through defenses
   */
  private handleTrafficLeaked(id: string): void {
    const entity = this.activeTraffic.get(id);
    if (!entity) return;

    const { data } = entity;

    // Emit event
    eventBus.emit('traffic-leaked', {
      type: data.type,
      damage: data.config.damage,
    });

    // Remove entity
    this.removeTraffic(id);
  }

  /**
   * Handle traffic being processed (destroyed)
   */
  processTraffic(id: string): void {
    const entity = this.activeTraffic.get(id);
    if (!entity) return;

    const { data } = entity;

    // Emit event
    eventBus.emit('traffic-processed', {
      type: data.type,
      reward: data.config.reward,
    });

    // Remove entity
    this.removeTraffic(id);
  }

  /**
   * Remove traffic entity
   */
  private removeTraffic(id: string): void {
    const entity = this.activeTraffic.get(id);
    if (!entity) return;

    // Dispose mesh
    entity.mesh.dispose();

    // Remove from maps
    this.activeTraffic.delete(id);
    this.trafficEntities.delete(id);
  }

  /**
   * Handle random events
   */
  private handleEvent(eventId: string, duration: number): void {
    switch (eventId) {
      case 'traffic-surge':
        this.rps *= 2.0;
        setTimeout(() => {
          this.rps /= 2.0;
        }, duration * 1000);
        break;
      case 'ddos-attack':
        this.trafficMix.malicious = 0.8;
        setTimeout(() => {
          this.trafficMix.malicious = 0.0;
        }, duration * 1000);
        break;
    }
  }

  /**
   * Set traffic RPS
   */
  setRps(rps: number): void {
    this.rps = rps;
  }

  /**
   * Set traffic mix
   */
  setTrafficMix(mix: {
    static: number;
    read: number;
    write: number;
    upload: number;
    search: number;
    malicious: number;
  }): void {
    this.trafficMix = mix;
  }

  /**
   * Get traffic entity by ID
   */
  getTraffic(id: string): TrafficEntityData | undefined {
    return this.trafficEntities.get(id);
  }

  /**
   * Get all traffic entities
   */
  getAllTraffic(): TrafficEntityData[] {
    return Array.from(this.trafficEntities.values());
  }

  /**
   * Clear all traffic
   */
  clear(): void {
    this.activeTraffic.forEach((entity) => {
      entity.mesh.dispose();
    });
    this.activeTraffic.clear();
    this.trafficEntities.clear();
  }

  /**
   * Dispose system
   */
  dispose(): void {
    this.clear();
  }
}
