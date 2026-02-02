import { Scene, ArcRotateCamera, Vector3, PointerEventTypes, PointerInfo } from '@babylonjs/core';

/**
 * Camera configuration options
 */
export interface CameraConfig {
  alpha?: number; // Horizontal rotation angle in radians
  beta?: number; // Vertical rotation angle in radians
  radius?: number; // Distance from target
  target?: Vector3; // Camera target position
  lowerRadiusLimit?: number; // Minimum zoom distance
  upperRadiusLimit?: number; // Maximum zoom distance
  lowerBetaLimit?: number; // Minimum vertical angle
  upperBetaLimit?: number; // Maximum vertical angle
  inertialPanningFriction?: number; // Panning friction
  inertia?: number; // Inertia factor
  angularSensibilityX?: number; // Horizontal rotation sensitivity
  angularSensibilityY?: number; // Vertical rotation sensitivity
  pinchPrecision?: number; // Touch pinch sensitivity
  panningSensibility?: number; // Panning sensitivity
  wheelPrecision?: number; // Mouse wheel zoom sensitivity
}

/**
 * CameraController - Manages the orbit camera for tower defense game
 */
export class CameraController {
  private scene: Scene;
  private camera: ArcRotateCamera | null = null;
  private target: Vector3;
  private isDisposed: boolean = false;

  // Configuration
  private config: Required<CameraConfig>;

  // Touch state
  private isTouchDevice: boolean = false;
  private initialPinchDistance: number = 0;
  private initialRadius: number = 0;

  constructor(scene: Scene, config: CameraConfig = {}) {
    this.scene = scene;
    this.target = config.target ?? Vector3.Zero();

    // Default configuration
    this.config = {
      alpha: config.alpha ?? -Math.PI / 4, // 45 degrees from right
      beta: config.beta ?? Math.PI / 3, // 60 degrees from horizontal (isometric view)
      radius: config.radius ?? 25,
      target: config.target ?? Vector3.Zero(),
      lowerRadiusLimit: config.lowerRadiusLimit ?? 10,
      upperRadiusLimit: config.upperRadiusLimit ?? 50,
      lowerBetaLimit: config.lowerBetaLimit ?? Math.PI / 6, // 30 degrees minimum
      upperBetaLimit: config.upperBetaLimit ?? Math.PI / 2.2, // ~81 degrees maximum
      inertialPanningFriction: config.inertialPanningFriction ?? 0.9,
      inertia: config.inertia ?? 0.9,
      angularSensibilityX: config.angularSensibilityX ?? 1000,
      angularSensibilityY: config.angularSensibilityY ?? 1000,
      pinchPrecision: config.pinchPrecision ?? 50,
      panningSensibility: config.panningSensibility ?? 50,
      wheelPrecision: config.wheelPrecision ?? 50,
    };

    this.detectTouchDevice();
    this.setupCamera();
  }

  /**
   * Detect if device is touch-enabled
   */
  private detectTouchDevice(): void {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Setup the camera
   */
  private setupCamera(): void {
    this.camera = new ArcRotateCamera(
      'camera',
      this.config.alpha,
      this.config.beta,
      this.config.radius,
      this.target,
      this.scene
    );

    // Configure camera limits
    this.camera.lowerRadiusLimit = this.config.lowerRadiusLimit;
    this.camera.upperRadiusLimit = this.config.upperRadiusLimit;
    this.camera.lowerBetaLimit = this.config.lowerBetaLimit;
    this.camera.upperBetaLimit = this.config.upperBetaLimit;

    // Configure inertia
    this.camera.inertialPanningX = this.config.inertialPanningFriction;
    this.camera.inertialPanningY = this.config.inertialPanningFriction;
    this.camera.inertia = this.config.inertia;

    // Configure sensitivity
    this.camera.angularSensibilityX = this.config.angularSensibilityX;
    this.camera.angularSensibilityY = this.config.angularSensibilityY;
    this.camera.pinchPrecision = this.config.pinchPrecision;
    this.camera.panningSensibility = this.config.panningSensibility;
    this.camera.wheelPrecision = this.config.wheelPrecision;

    // Enable panning
    this.camera.panningSensibility = this.config.panningSensibility;
    this.camera.panningInertia = this.config.inertialPanningFriction;

    // Attach controls
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);

    // Setup touch-specific behavior
    if (this.isTouchDevice) {
      this.setupTouchControls();
    }

    // Attach camera to scene
    this.scene.activeCamera = this.camera;
  }

  /**
   * Setup touch-specific controls
   */
  private setupTouchControls(): void {
    if (!this.camera) return;

    // Handle pinch-to-zoom
    this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
          this.handleTouchDown(pointerInfo);
        }
      } else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
        if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
          this.handleTouchUp(pointerInfo);
        }
      } else if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
        if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
          this.handleTouchMove(pointerInfo);
        }
      }
    });
  }

  /**
   * Handle touch down event
   */
  private handleTouchDown(_pointerInfo: PointerInfo): void {
    // Track initial pinch distance for multi-touch
    const touches = this.getTouches();
    if (touches.length === 2) {
      this.initialPinchDistance = this.getDistance(touches[0], touches[1]);
      this.initialRadius = this.camera?.radius ?? this.config.radius;
    }
  }

  /**
   * Handle touch up event
   */
  private handleTouchUp(_pointerInfo: PointerInfo): void {
    this.initialPinchDistance = 0;
    this.initialRadius = 0;
  }

  /**
   * Handle touch move event
   */
  private handleTouchMove(_pointerInfo: PointerInfo): void {
    const touches = this.getTouches();
    
    if (touches.length === 2 && this.camera) {
      // Handle pinch-to-zoom
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const scaleFactor = this.initialPinchDistance / currentDistance;
      const newRadius = this.initialRadius * scaleFactor;
      
      // Clamp radius to limits
      this.camera.radius = Math.max(
        this.config.lowerRadiusLimit,
        Math.min(this.config.upperRadiusLimit, newRadius)
      );
    }
  }

  /**
   * Get active touch points
   */
  private getTouches(): Touch[] {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (!canvas) return [];
    
    // @ts-ignore - TouchEvent may not be in standard types
    const event = window.event as TouchEvent;
    return event?.touches ? Array.from(event.touches) : [];
  }

  /**
   * Get distance between two touch points
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get the camera instance
   */
  getCamera(): ArcRotateCamera | null {
    return this.camera;
  }

  /**
   * Set camera target
   */
  setTarget(target: Vector3): void {
    this.target = target;
    if (this.camera) {
      this.camera.setTarget(target);
    }
  }

  /**
   * Get camera target
   */
  getTarget(): Vector3 {
    return this.target.clone();
  }

  /**
   * Set camera radius (zoom level)
   */
  setRadius(radius: number): void {
    if (this.camera) {
      this.camera.radius = Math.max(
        this.config.lowerRadiusLimit,
        Math.min(this.config.upperRadiusLimit, radius)
      );
    }
  }

  /**
   * Get camera radius
   */
  getRadius(): number {
    return this.camera?.radius ?? this.config.radius;
  }

  /**
   * Set camera alpha (horizontal rotation)
   */
  setAlpha(alpha: number): void {
    if (this.camera) {
      this.camera.alpha = alpha;
    }
  }

  /**
   * Get camera alpha
   */
  getAlpha(): number {
    return this.camera?.alpha ?? this.config.alpha;
  }

  /**
   * Set camera beta (vertical rotation)
   */
  setBeta(beta: number): void {
    if (this.camera) {
      this.camera.beta = Math.max(
        this.config.lowerBetaLimit ?? 0,
        Math.min(this.config.upperBetaLimit ?? Math.PI, beta)
      );
    }
  }

  /**
   * Get camera beta
   */
  getBeta(): number {
    return this.camera?.beta ?? this.config.beta;
  }

  /**
   * Zoom in
   */
  zoomIn(amount: number = 5): void {
    this.setRadius(this.getRadius() - amount);
  }

  /**
   * Zoom out
   */
  zoomOut(amount: number = 5): void {
    this.setRadius(this.getRadius() + amount);
  }

  /**
   * Rotate camera horizontally
   */
  rotateHorizontal(angle: number): void {
    this.setAlpha(this.getAlpha() + angle);
  }

  /**
   * Rotate camera vertically
   */
  rotateVertical(angle: number): void {
    this.setBeta(this.getBeta() + angle);
  }

  /**
   * Pan camera horizontally
   */
  panHorizontal(delta: number): void {
    if (!this.camera) return;
    
    const direction = new Vector3(
      Math.sin(this.camera.alpha),
      0,
      Math.cos(this.camera.alpha)
    );
    const movement = direction.scale(delta);
    const newTarget = this.target.add(movement);
    this.setTarget(newTarget);
  }

  /**
   * Pan camera vertically
   */
  panVertical(delta: number): void {
    if (!this.camera) return;
    
    const direction = new Vector3(
      Math.cos(this.camera.alpha),
      0,
      -Math.sin(this.camera.alpha)
    );
    const movement = direction.scale(delta);
    const newTarget = this.target.add(movement);
    this.setTarget(newTarget);
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    if (this.camera) {
      this.camera.alpha = this.config.alpha;
      this.camera.beta = this.config.beta;
      this.camera.radius = this.config.radius;
      this.camera.setTarget(this.config.target);
    }
  }

  /**
   * Focus camera on a specific position
   */
  focusOn(position: Vector3, duration: number = 1): void {
    if (!this.camera) return;

    // Simple animation to focus on position
    const startTarget = this.target.clone();
    const startTime = Date.now();

    const animate = () => {
      if (this.isDisposed) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newTarget = Vector3.Lerp(startTarget, position, eased);
      this.setTarget(newTarget);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Enable/disable camera controls
   */
  setControlsEnabled(enabled: boolean): void {
    if (this.camera) {
      if (enabled) {
        this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
      } else {
        this.camera.detachControl();
      }
    }
  }

  /**
   * Check if controls are enabled
   */
  isControlsEnabled(): boolean {
    return this.camera?.inputs.attachedToElement !== null;
  }

  /**
   * Dispose camera controller
   */
  dispose(): void {
    this.isDisposed = true;
    
    if (this.camera) {
      this.camera.dispose();
      this.camera = null;
    }
  }
}
