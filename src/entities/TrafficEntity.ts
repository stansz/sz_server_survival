import { Scene, Vector3, Mesh, StandardMaterial, Color3, MeshBuilder } from '@babylonjs/core';
import { TrafficEntityData, TrafficType, TrafficConfig } from '../types/traffic.types';

/**
 * TrafficEntity - Represents a single traffic/enemy entity in the game
 */
export class TrafficEntity {
  public readonly id: string;
  public readonly type: TrafficType;
  public readonly config: TrafficConfig;
  
  private scene: Scene;
  private mesh: Mesh | null = null;
  private material: StandardMaterial | null = null;
  
  private path: Vector3[];
  private currentPathIndex: number = 0;
  private health: number;
  private maxHealth: number;
  private speed: number;
  private isDestroyed: boolean = false;

  constructor(data: TrafficEntityData, scene: Scene) {
    this.id = data.id;
    this.type = data.type;
    this.config = data.config;
    this.scene = scene;
    this.path = data.path;
    this.health = data.health;
    this.maxHealth = data.maxHealth;
    this.speed = data.speed;

    this.createMesh(data.position);
  }

  /**
   * Create the mesh for this traffic entity
   */
  private createMesh(position: Vector3): void {
    const size = 0.5;
    this.mesh = MeshBuilder.CreateBox(`traffic-${this.id}`, { size }, this.scene);
    this.mesh.position = position.clone();
    this.mesh.position.y = size / 2;

    this.material = new StandardMaterial(`traffic-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(this.config.color);
    this.material.emissiveColor = Color3.FromHexString(this.config.color).scale(0.3);
    this.mesh.material = this.material;
  }

  /**
   * Update entity position and state
   * @param deltaTime Time since last frame in seconds
   * @returns true if entity reached destination, false otherwise
   */
  update(deltaTime: number): boolean {
    if (!this.mesh || this.isDestroyed) {
      return false;
    }

    // Move along path
    if (this.currentPathIndex < this.path.length) {
      const nextPos = this.path[this.currentPathIndex];
      const direction = nextPos.subtract(this.mesh.position);
      const distance = direction.length();

      if (distance < 0.1) {
        // Reached waypoint, move to next
        this.currentPathIndex++;
        return this.currentPathIndex >= this.path.length;
      } else {
        // Move towards waypoint
        const moveDir = direction.normalize();
        const moveSpeed = this.speed * deltaTime * 2;
        this.mesh.position.addInPlace(moveDir.scale(moveSpeed));
        return false;
      }
    }

    // Reached destination
    return true;
  }

  /**
   * Apply damage to this entity
   * @param damage Amount of damage to apply
   * @returns true if entity was destroyed, false otherwise
   */
  takeDamage(damage: number): boolean {
    this.health -= damage;
    
    // Update material emissive color based on health
    if (this.material) {
      const healthPercent = this.health / this.maxHealth;
      this.material.emissiveColor = Color3.FromHexString(this.config.color).scale(0.3 * healthPercent);
    }

    if (this.health <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Get current position
   */
  getPosition(): Vector3 {
    return this.mesh?.position.clone() ?? Vector3.Zero();
  }

  /**
   * Get current health
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Get max health
   */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Get health percentage (0-1)
   */
  getHealthPercent(): number {
    return this.health / this.maxHealth;
  }

  /**
   * Check if entity is destroyed
   */
  isAlive(): boolean {
    return !this.isDestroyed;
  }

  /**
   * Get the mesh
   */
  getMesh(): Mesh | null {
    return this.mesh;
  }

  /**
   * Set a new path for this entity
   */
  setPath(path: Vector3[]): void {
    this.path = path;
    this.currentPathIndex = 0;
  }

  /**
   * Destroy this entity
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
    
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
  }

  /**
   * Get entity data for serialization
   */
  getData(): TrafficEntityData {
    return {
      id: this.id,
      type: this.type,
      position: this.getPosition(),
      path: this.path,
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      config: this.config,
    };
  }
}
