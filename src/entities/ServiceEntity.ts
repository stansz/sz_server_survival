import { Scene, Vector3, Mesh, StandardMaterial, Color3, MeshBuilder } from '@babylonjs/core';
import { ServiceEntityData, ServiceType, ServiceConfig } from '../types/service.types';

/**
 * ServiceEntity - Represents a single service/tower entity in the game
 */
export class ServiceEntity {
  public readonly id: string;
  public readonly type: ServiceType;
  public readonly config: ServiceConfig;
  
  private scene: Scene;
  private mesh: Mesh | null = null;
  private rangeMesh: Mesh | null = null;
  private material: StandardMaterial | null = null;
  private rangeMaterial: StandardMaterial | null = null;
  
  private gridPosition: { x: number; z: number };
  private level: number;
  private health: number;
  private maxHealth: number;
  private targets: string[] = [];
  private lastAttackTime: number = 0;
  private isDestroyed: boolean = false;

  constructor(data: ServiceEntityData, scene: Scene) {
    this.id = data.id;
    this.type = data.type;
    this.config = data.config;
    this.scene = scene;
    this.gridPosition = data.gridPosition;
    this.level = data.level;
    this.health = data.health;
    this.maxHealth = data.maxHealth;
    this.targets = data.targets;
    this.lastAttackTime = data.lastAttackTime;

    this.createMesh(data.position);
    this.createRangeMesh();
  }

  /**
   * Create mesh for this service entity
   */
  private createMesh(position: Vector3): void {
    const size = 1.5;
    const height = 2;

    this.mesh = MeshBuilder.CreateCylinder(
      `service-${this.id}`,
      { diameterTop: size, diameterBottom: size, height, tessellation: 6 },
      this.scene
    );
    this.mesh.position = position.clone();
    this.mesh.position.y = height / 2;

    this.material = new StandardMaterial(`service-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(this.config.color);
    this.material.emissiveColor = Color3.FromHexString(this.config.color).scale(0.2);
    this.mesh.material = this.material;
  }

  /**
   * Create range indicator mesh
   */
  private createRangeMesh(): void {
    const levelConfig = this.config.levels[this.level - 1];

    this.rangeMesh = MeshBuilder.CreateDisc(
      `range-${this.id}`,
      { radius: levelConfig.range, tessellation: 32 },
      this.scene
    );
    this.rangeMesh.position = this.mesh?.position.clone() ?? Vector3.Zero();
    this.rangeMesh.position.y = 0.1;
    this.rangeMesh.rotation.x = Math.PI / 2;

    this.rangeMaterial = new StandardMaterial(`range-mat-${this.id}`, this.scene);
    this.rangeMaterial.diffuseColor = Color3.FromHexString(this.config.color);
    this.rangeMaterial.alpha = 0.2;
    this.rangeMaterial.emissiveColor = Color3.FromHexString(this.config.color).scale(0.1);
    this.rangeMesh.material = this.rangeMaterial;
  }

  /**
   * Update range mesh when level changes
   */
  private updateRangeMesh(): void {
    if (this.rangeMesh) {
      this.rangeMesh.dispose();
    }
    if (this.rangeMaterial) {
      this.rangeMaterial.dispose();
    }
    this.createRangeMesh();
  }

  /**
   * Update entity state
   * @param now Current timestamp in milliseconds
   * @returns Array of target IDs that can be attacked, or empty array
   */
  update(now: number): string[] {
    if (this.isDestroyed) {
      return [];
    }

    const levelConfig = this.config.levels[this.level - 1];
    const timeSinceLastAttack = now - this.lastAttackTime;
    const attackInterval = 1000 / levelConfig.attackSpeed;

    if (timeSinceLastAttack >= attackInterval) {
      this.lastAttackTime = now;
      return this.targets;
    }

    return [];
  }

  /**
   * Set targets for this service
   */
  setTargets(targets: string[]): void {
    this.targets = targets;
  }

  /**
   * Get current targets
   */
  getTargets(): string[] {
    return this.targets;
  }

  /**
   * Get current attack range
   */
  getRange(): number {
    const levelConfig = this.config.levels[this.level - 1];
    return levelConfig.range;
  }

  /**
   * Get current damage
   */
  getDamage(): number {
    const levelConfig = this.config.levels[this.level - 1];
    return levelConfig.damage;
  }

  /**
   * Get current attack speed
   */
  getAttackSpeed(): number {
    const levelConfig = this.config.levels[this.level - 1];
    return levelConfig.attackSpeed;
  }

  /**
   * Upgrade this service to next level
   * @returns true if upgrade succeeded, false otherwise
   */
  upgrade(): boolean {
    const nextLevel = this.level + 1;

    if (nextLevel > this.config.levels.length) {
      return false; // Already max level
    }

    this.level = nextLevel;
    const levelConfig = this.config.levels[nextLevel - 1];
    this.health = levelConfig.health;
    this.maxHealth = levelConfig.maxHealth;

    // Update range mesh
    this.updateRangeMesh();

    return true;
  }

  /**
   * Get current level
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Get max level
   */
  getMaxLevel(): number {
    return this.config.levels.length;
  }

  /**
   * Check if can upgrade
   */
  canUpgrade(): boolean {
    return this.level < this.config.levels.length;
  }

  /**
   * Apply damage to this service
   * @param damage Amount of damage to apply
   * @returns true if service was destroyed, false otherwise
   */
  takeDamage(damage: number): boolean {
    this.health -= damage;

    // Update material emissive color based on health
    if (this.material) {
      const healthPercent = this.health / this.maxHealth;
      this.material.emissiveColor = Color3.FromHexString(this.config.color).scale(0.2 * healthPercent);
    }

    if (this.health <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Repair this service
   * @param amount Amount of health to restore
   */
  repair(amount: number): void {
    this.health = Math.min(this.health + amount, this.maxHealth);

    // Update material emissive color
    if (this.material) {
      const healthPercent = this.health / this.maxHealth;
      this.material.emissiveColor = Color3.FromHexString(this.config.color).scale(0.2 * healthPercent);
    }
  }

  /**
   * Apply degradation (health loss over time)
   * @param amount Amount of health to lose
   * @returns true if service was destroyed, false otherwise
   */
  applyDegradation(amount: number): boolean {
    return this.takeDamage(amount);
  }

  /**
   * Get current position
   */
  getPosition(): Vector3 {
    return this.mesh?.position.clone() ?? Vector3.Zero();
  }

  /**
   * Get grid position
   */
  getGridPosition(): { x: number; z: number } {
    return { ...this.gridPosition };
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
   * Get upkeep cost for current level
   */
  getUpkeep(): number {
    const levelConfig = this.config.levels[this.level - 1];
    return levelConfig.upkeep;
  }

  /**
   * Check if entity is destroyed
   */
  isAlive(): boolean {
    return !this.isDestroyed;
  }

  /**
   * Get mesh
   */
  getMesh(): Mesh | null {
    return this.mesh;
  }

  /**
   * Get range mesh
   */
  getRangeMesh(): Mesh | null {
    return this.rangeMesh;
  }

  /**
   * Show/hide range indicator
   */
  showRange(show: boolean): void {
    if (this.rangeMesh) {
      this.rangeMesh.setEnabled(show);
    }
  }

  /**
   * Destroy this service
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
    
    if (this.rangeMesh) {
      this.rangeMesh.dispose();
      this.rangeMesh = null;
    }
    
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    
    if (this.rangeMaterial) {
      this.rangeMaterial.dispose();
      this.rangeMaterial = null;
    }
  }

  /**
   * Get entity data for serialization
   */
  getData(): ServiceEntityData {
    return {
      id: this.id,
      type: this.type,
      position: this.getPosition(),
      gridPosition: this.getGridPosition(),
      level: this.level,
      health: this.health,
      maxHealth: this.maxHealth,
      config: this.config,
      targets: this.targets,
      lastAttackTime: this.lastAttackTime,
    };
  }
}
