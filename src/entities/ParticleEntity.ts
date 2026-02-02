import { Scene, Vector3, Mesh, StandardMaterial, Color3, Color4, MeshBuilder, ParticleSystem, DynamicTexture } from '@babylonjs/core';

/**
 * Particle effect types
 */
export enum ParticleType {
  EXPLOSION = 'explosion',
  HIT = 'hit',
  HEAL = 'heal',
  SPAWN = 'spawn',
  UPGRADE = 'upgrade',
  DAMAGE = 'damage',
}

/**
 * Particle effect configuration
 */
export interface ParticleConfig {
  type: ParticleType;
  position: Vector3;
  color: string;
  size: number;
  lifetime: number;
  count?: number;
}

/**
 * ParticleEntity - Represents visual effects in the game
 */
export class ParticleEntity {
  public readonly id: string;
  public readonly type: ParticleType;
  
  private scene: Scene;
  private mesh: Mesh | null = null;
  private particleSystem: ParticleSystem | null = null;
  private material: StandardMaterial | null = null;
  private lifetime: number;
  private age: number = 0;
  private isDestroyed: boolean = false;

  constructor(config: ParticleConfig, scene: Scene) {
    this.id = `particle-${Date.now()}-${Math.random()}`;
    this.type = config.type;
    this.scene = scene;
    this.lifetime = config.lifetime;

    this.createEffect(config);
  }

  /**
   * Create particle effect based on type
   */
  private createEffect(config: ParticleConfig): void {
    switch (this.type) {
      case ParticleType.EXPLOSION:
        this.createExplosion(config);
        break;
      case ParticleType.HIT:
        this.createHit(config);
        break;
      case ParticleType.HEAL:
        this.createHeal(config);
        break;
      case ParticleType.SPAWN:
        this.createSpawn(config);
        break;
      case ParticleType.UPGRADE:
        this.createUpgrade(config);
        break;
      case ParticleType.DAMAGE:
        this.createDamage(config);
        break;
      default:
        this.createDefault(config);
    }
  }

  /**
   * Create explosion effect
   */
  private createExplosion(config: ParticleConfig): void {
    // Create expanding sphere
    const size = config.size;
    this.mesh = MeshBuilder.CreateSphere(
      `explosion-${this.id}`,
      { diameter: size, segments: 16 },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = size / 2;

    this.material = new StandardMaterial(`explosion-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.8;
    this.mesh.material = this.material;

    // Create particle system
    this.particleSystem = new ParticleSystem(`particles-${this.id}`, config.count || 50, this.scene);
    this.particleSystem.particleTexture = this.createParticleTexture(config.color);
    this.particleSystem.emitter = this.mesh;
    this.particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
    this.particleSystem.maxEmitBox = new Vector3(0.5, 0.5, 0.5);
    const color = Color3.FromHexString(config.color);
    this.particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
    this.particleSystem.color2 = new Color4(color.r, color.g, color.b, 1.0);
    this.particleSystem.colorDead = new Color4(0, 0, 0, 1);
    this.particleSystem.minSize = 0.1;
    this.particleSystem.maxSize = 0.3;
    this.particleSystem.minLifeTime = 0.3;
    this.particleSystem.maxLifeTime = 0.6;
    this.particleSystem.emitRate = 100;
    this.particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    this.particleSystem.gravity = new Vector3(0, -9.81, 0);
    this.particleSystem.direction1 = new Vector3(-1, 1, -1);
    this.particleSystem.direction2 = new Vector3(1, 1, 1);
    this.particleSystem.minEmitPower = 1;
    this.particleSystem.maxEmitPower = 3;
    this.particleSystem.updateSpeed = 0.01;
    this.particleSystem.start();
  }

  /**
   * Create hit effect
   */
  private createHit(config: ParticleConfig): void {
    // Create small flash
    const size = config.size * 0.5;
    this.mesh = MeshBuilder.CreateBox(
      `hit-${this.id}`,
      { size },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = size / 2;

    this.material = new StandardMaterial(`hit-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 1.0;
    this.mesh.material = this.material;
  }

  /**
   * Create heal effect
   */
  private createHeal(config: ParticleConfig): void {
    // Create rising particles
    this.mesh = MeshBuilder.CreateCylinder(
      `heal-${this.id}`,
      { diameterTop: 0.1, diameterBottom: 0.5, height: config.size, tessellation: 8 },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = config.size / 2;

    this.material = new StandardMaterial(`heal-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.6;
    this.mesh.material = this.material;
  }

  /**
   * Create spawn effect
   */
  private createSpawn(config: ParticleConfig): void {
    // Create expanding ring
    this.mesh = MeshBuilder.CreateTorus(
      `spawn-${this.id}`,
      { diameter: config.size, thickness: 0.2, tessellation: 32 },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.rotation.x = Math.PI / 2;

    this.material = new StandardMaterial(`spawn-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.8;
    this.mesh.material = this.material;
  }

  /**
   * Create upgrade effect
   */
  private createUpgrade(config: ParticleConfig): void {
    // Create rising sparkles - using Polyhedron instead of Octahedron
    this.mesh = MeshBuilder.CreatePolyhedron(
      `upgrade-${this.id}`,
      { type: 0, size: config.size },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = config.size / 2;

    this.material = new StandardMaterial(`upgrade-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.9;
    this.mesh.material = this.material;

    // Create particle system
    this.particleSystem = new ParticleSystem(`particles-${this.id}`, config.count || 30, this.scene);
    this.particleSystem.particleTexture = this.createParticleTexture(config.color);
    this.particleSystem.emitter = this.mesh;
    this.particleSystem.minEmitBox = new Vector3(-0.3, -0.3, -0.3);
    this.particleSystem.maxEmitBox = new Vector3(0.3, 0.3, 0.3);
    const color = Color3.FromHexString(config.color);
    this.particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
    this.particleSystem.color2 = new Color4(color.r, color.g, color.b, 1.0);
    this.particleSystem.colorDead = new Color4(0, 0, 0, 1);
    this.particleSystem.minSize = 0.05;
    this.particleSystem.maxSize = 0.15;
    this.particleSystem.minLifeTime = 0.5;
    this.particleSystem.maxLifeTime = 1.0;
    this.particleSystem.emitRate = 50;
    this.particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    this.particleSystem.gravity = new Vector3(0, 2, 0); // Particles rise up
    this.particleSystem.direction1 = new Vector3(-0.5, 1, -0.5);
    this.particleSystem.direction2 = new Vector3(0.5, 1, 0.5);
    this.particleSystem.minEmitPower = 0.5;
    this.particleSystem.maxEmitPower = 1.5;
    this.particleSystem.updateSpeed = 0.01;
    this.particleSystem.start();
  }

  /**
   * Create damage effect
   */
  private createDamage(config: ParticleConfig): void {
    // Create shrinking sphere
    const size = config.size;
    this.mesh = MeshBuilder.CreateSphere(
      `damage-${this.id}`,
      { diameter: size, segments: 12 },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = size / 2;

    this.material = new StandardMaterial(`damage-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.7;
    this.mesh.material = this.material;
  }

  /**
   * Create default effect
   */
  private createDefault(config: ParticleConfig): void {
    const size = config.size;
    this.mesh = MeshBuilder.CreateSphere(
      `particle-${this.id}`,
      { diameter: size, segments: 8 },
      this.scene
    );
    this.mesh.position = config.position.clone();
    this.mesh.position.y = size / 2;

    this.material = new StandardMaterial(`particle-mat-${this.id}`, this.scene);
    this.material.diffuseColor = Color3.FromHexString(config.color);
    this.material.emissiveColor = Color3.FromHexString(config.color);
    this.material.alpha = 0.5;
    this.mesh.material = this.material;
  }

  /**
   * Create particle texture
   */
  private createParticleTexture(color: string): any {
    // Create a simple particle texture using a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }

    const texture = new DynamicTexture(`particle-tex-${this.id}`, canvas, this.scene);
    texture.update();
    return texture;
  }

  /**
   * Update particle effect
   * @param deltaTime Time since last frame in seconds
   * @returns true if particle effect is complete, false otherwise
   */
  update(deltaTime: number): boolean {
    if (this.isDestroyed) {
      return true;
    }

    this.age += deltaTime;

    // Update based on type
    switch (this.type) {
      case ParticleType.EXPLOSION:
        this.updateExplosion(deltaTime);
        break;
      case ParticleType.HIT:
        this.updateHit(deltaTime);
        break;
      case ParticleType.HEAL:
        this.updateHeal(deltaTime);
        break;
      case ParticleType.SPAWN:
        this.updateSpawn(deltaTime);
        break;
      case ParticleType.UPGRADE:
        this.updateUpgrade(deltaTime);
        break;
      case ParticleType.DAMAGE:
        this.updateDamage(deltaTime);
        break;
    }

    // Check if lifetime exceeded
    if (this.age >= this.lifetime) {
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Update explosion effect
   */
  private updateExplosion(_deltaTime: number): void {
    if (this.mesh) {
      const scale = 1 + this.age * 3;
      this.mesh.scaling.set(scale, scale, scale);
      if (this.material) {
        this.material.alpha = Math.max(0, 0.8 - this.age * 0.8);
      }
    }
  }

  /**
   * Update hit effect
   */
  private updateHit(_deltaTime: number): void {
    if (this.mesh) {
      const scale = 1 - this.age * 2;
      this.mesh.scaling.set(scale, scale, scale);
      if (this.material) {
        this.material.alpha = Math.max(0, 1 - this.age * 2);
      }
    }
  }

  /**
   * Update heal effect
   */
  private updateHeal(_deltaTime: number): void {
    if (this.mesh) {
      this.mesh.position.y += _deltaTime * 2;
      if (this.material) {
        this.material.alpha = Math.max(0, 0.6 - this.age * 0.6);
      }
    }
  }

  /**
   * Update spawn effect
   */
  private updateSpawn(_deltaTime: number): void {
    if (this.mesh) {
      const scale = 1 + this.age * 2;
      this.mesh.scaling.set(scale, scale, scale);
      if (this.material) {
        this.material.alpha = Math.max(0, 0.8 - this.age * 0.8);
      }
    }
  }

  /**
   * Update upgrade effect
   */
  private updateUpgrade(_deltaTime: number): void {
    if (this.mesh) {
      this.mesh.rotation.y += _deltaTime * 5;
      this.mesh.position.y += _deltaTime;
      if (this.material) {
        this.material.alpha = Math.max(0, 0.9 - this.age * 0.9);
      }
    }
  }

  /**
   * Update damage effect
   */
  private updateDamage(_deltaTime: number): void {
    if (this.mesh) {
      const scale = 1 - this.age * 1.5;
      this.mesh.scaling.set(scale, scale, scale);
      if (this.material) {
        this.material.alpha = Math.max(0, 0.7 - this.age * 0.7);
      }
    }
  }

  /**
   * Get current position
   */
  getPosition(): Vector3 {
    return this.mesh?.position.clone() ?? Vector3.Zero();
  }

  /**
   * Get mesh
   */
  getMesh(): Mesh | null {
    return this.mesh;
  }

  /**
   * Check if particle effect is complete
   */
  isComplete(): boolean {
    return this.age >= this.lifetime || this.isDestroyed;
  }

  /**
   * Destroy this particle effect
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    if (this.particleSystem) {
      this.particleSystem.stop();
      this.particleSystem.dispose();
      this.particleSystem = null;
    }
    
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
    
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
  }
}
