import { Scene, Vector3, PointerEventTypes, PointerInfo, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';

/**
 * Input event types
 */
export enum InputEventType {
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  RIGHT_CLICK = 'right_click',
  DRAG_START = 'drag_start',
  DRAG_MOVE = 'drag_move',
  DRAG_END = 'drag_end',
  KEY_DOWN = 'key_down',
  KEY_UP = 'key_up',
  PINCH_START = 'pinch_start',
  PINCH_MOVE = 'pinch_move',
  PINCH_END = 'pinch_end',
}

/**
 * Input event data
 */
export interface InputEvent {
  type: InputEventType;
  position: Vector3;
  screenPosition: { x: number; y: number };
  delta?: Vector3;
  key?: string;
  timestamp: number;
}

/**
 * Input event handler type
 */
export type InputEventHandler = (event: InputEvent) => void;

/**
 * InputManager - Handles mouse, touch, and keyboard input
 */
export class InputManager {
  private scene: Scene;
  private isDisposed: boolean = false;

  // Event handlers
  private eventHandlers: Map<InputEventType, Set<InputEventHandler>> = new Map();

  // State tracking
  private isDragging: boolean = false;
  private dragStartPosition: Vector3 = Vector3.Zero();
  private dragCurrentPosition: Vector3 = Vector3.Zero();
  private lastClickTime: number = 0;
  private lastClickPosition: { x: number; y: number } = { x: 0, y: 0 };

  // Touch state
  private activeTouches: Map<number, { x: number; y: number }> = new Map();
  private initialPinchDistance: number = 0;
  private isPinching: boolean = false;

  // Raycasting
  private groundPlane: any = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupInputHandlers();
    this.createGroundPlane();
  }

  /**
   * Create invisible ground plane for raycasting
   */
  private createGroundPlane(): void {
    this.groundPlane = MeshBuilder.CreateGround(
      'input-ground',
      { width: 100, height: 100 },
      this.scene
    );
    this.groundPlane.isPickable = true;
    this.groundPlane.isVisible = false;

    const material = new StandardMaterial('input-ground-mat', this.scene);
    material.diffuseColor = Color3.Black();
    material.alpha = 0;
    this.groundPlane.material = material;
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    // Pointer events (mouse and touch)
    this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      this.handlePointerEvent(pointerInfo);
    });

    // Keyboard events
    this.scene.getEngine().getRenderingCanvas()?.addEventListener('keydown', (e) => {
      this.handleKeyDown(e as KeyboardEvent);
    });

    this.scene.getEngine().getRenderingCanvas()?.addEventListener('keyup', (e) => {
      this.handleKeyUp(e as KeyboardEvent);
    });
  }

  /**
   * Handle pointer events
   */
  private handlePointerEvent(pointerInfo: PointerInfo): void {
    const { type, event } = pointerInfo;
    const screenPosition = this.getScreenPosition(event);

    switch (type) {
      case PointerEventTypes.POINTERDOWN:
        this.handlePointerDown(pointerInfo, screenPosition);
        break;
      case PointerEventTypes.POINTERUP:
        this.handlePointerUp(pointerInfo, screenPosition);
        break;
      case PointerEventTypes.POINTERMOVE:
        this.handlePointerMove(pointerInfo, screenPosition);
        break;
      case PointerEventTypes.POINTERDOUBLETAP:
        this.handleDoubleClick(screenPosition);
        break;
    }
  }

  /**
   * Handle pointer down
   */
  private handlePointerDown(pointerInfo: PointerInfo, screenPosition: { x: number; y: number }): void {
    const worldPosition = this.getWorldPosition(screenPosition);
    
    // Track touch points
    if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
      this.activeTouches.set(pointerInfo.event.pointerId, screenPosition);
      
      // Check for pinch gesture (2+ touches)
      if (this.activeTouches.size >= 2) {
        this.handlePinchStart();
        return;
      }
    }

    // Check for right click
    if (pointerInfo.event instanceof MouseEvent && pointerInfo.event.button === 2) {
      this.emitEvent({
        type: InputEventType.RIGHT_CLICK,
        position: worldPosition,
        screenPosition,
        timestamp: Date.now(),
      });
      return;
    }

    // Start drag
    this.isDragging = true;
    this.dragStartPosition = worldPosition;
    this.dragCurrentPosition = worldPosition;

    this.emitEvent({
      type: InputEventType.DRAG_START,
      position: worldPosition,
      screenPosition,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle pointer up
   */
  private handlePointerUp(pointerInfo: PointerInfo, screenPosition: { x: number; y: number }): void {
    const worldPosition = this.getWorldPosition(screenPosition);

    // Remove touch point
    if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
      this.activeTouches.delete(pointerInfo.event.pointerId);
      
      // End pinch gesture
      if (this.activeTouches.size < 2 && this.isPinching) {
        this.handlePinchEnd();
        return;
      }
    }

    // End drag
    if (this.isDragging) {
      this.isDragging = false;

      // Check if this was a click (minimal movement)
      const distance = Vector3.Distance(this.dragStartPosition, this.dragCurrentPosition);
      if (distance < 0.5) {
        this.handleClick(screenPosition);
      }

      this.emitEvent({
        type: InputEventType.DRAG_END,
        position: worldPosition,
        screenPosition,
        delta: worldPosition.subtract(this.dragStartPosition),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle pointer move
   */
  private handlePointerMove(pointerInfo: PointerInfo, screenPosition: { x: number; y: number }): void {
    const worldPosition = this.getWorldPosition(screenPosition);

    // Update touch point
    if (pointerInfo.event instanceof PointerEvent && pointerInfo.event.pointerType === 'touch') {
      this.activeTouches.set(pointerInfo.event.pointerId, screenPosition);
      
      // Handle pinch move
      if (this.isPinching) {
        this.handlePinchMove();
        return;
      }
    }

    // Handle drag
    if (this.isDragging) {
      this.dragCurrentPosition = worldPosition;
      
      this.emitEvent({
        type: InputEventType.DRAG_MOVE,
        position: worldPosition,
        screenPosition,
        delta: worldPosition.subtract(this.dragCurrentPosition),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle click
   */
  private handleClick(screenPosition: { x: number; y: number }): void {
    const now = Date.now();
    const timeSinceLastClick = now - this.lastClickTime;
    const distanceFromLastClick = Math.sqrt(
      Math.pow(screenPosition.x - this.lastClickPosition.x, 2) +
      Math.pow(screenPosition.y - this.lastClickPosition.y, 2)
    );

    // Check for double click
    if (timeSinceLastClick < 300 && distanceFromLastClick < 20) {
      this.handleDoubleClick(screenPosition);
      this.lastClickTime = 0;
      return;
    }

    this.lastClickTime = now;
    this.lastClickPosition = screenPosition;

    const worldPosition = this.getWorldPosition(screenPosition);
    this.emitEvent({
      type: InputEventType.CLICK,
      position: worldPosition,
      screenPosition,
      timestamp: now,
    });
  }

  /**
   * Handle double click
   */
  private handleDoubleClick(screenPosition: { x: number; y: number }): void {
    const worldPosition = this.getWorldPosition(screenPosition);
    this.emitEvent({
      type: InputEventType.DOUBLE_CLICK,
      position: worldPosition,
      screenPosition,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle pinch start
   */
  private handlePinchStart(): void {
    const touches = Array.from(this.activeTouches.values());
    if (touches.length >= 2) {
      this.initialPinchDistance = this.getDistance(touches[0], touches[1]);
      this.isPinching = true;
      
      this.emitEvent({
        type: InputEventType.PINCH_START,
        position: Vector3.Zero(),
        screenPosition: { x: 0, y: 0 },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle pinch move
   */
  private handlePinchMove(): void {
    const touches = Array.from(this.activeTouches.values());
    if (touches.length >= 2) {
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const scale = currentDistance / this.initialPinchDistance;
      
      this.emitEvent({
        type: InputEventType.PINCH_MOVE,
        position: new Vector3(scale, 0, 0),
        screenPosition: { x: 0, y: 0 },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle pinch end
   */
  private handlePinchEnd(): void {
    this.isPinching = false;
    this.initialPinchDistance = 0;
    
    this.emitEvent({
      type: InputEventType.PINCH_END,
      position: Vector3.Zero(),
      screenPosition: { x: 0, y: 0 },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle key down
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.emitEvent({
      type: InputEventType.KEY_DOWN,
      position: Vector3.Zero(),
      screenPosition: { x: 0, y: 0 },
      key: event.key,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle key up
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.emitEvent({
      type: InputEventType.KEY_UP,
      position: Vector3.Zero(),
      screenPosition: { x: 0, y: 0 },
      key: event.key,
      timestamp: Date.now(),
    });
  }

  /**
   * Get screen position from event
   */
  private getScreenPosition(event: any): { x: number; y: number } {
    if (event instanceof PointerEvent) {
      return { x: event.clientX, y: event.clientY };
    } else if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else if (event instanceof TouchEvent) {
      return { x: event.touches[0]?.clientX ?? 0, y: event.touches[0]?.clientY ?? 0 };
    }
    return { x: 0, y: 0 };
  }

  /**
   * Get world position from screen position using raycasting
   */
  private getWorldPosition(screenPosition: { x: number; y: number }): Vector3 {
    const ray = this.scene.createPickingRay(
      screenPosition.x,
      screenPosition.y,
      this.scene.getTransformMatrix(),
      this.scene.activeCamera
    );

    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh === this.groundPlane;
    });

    if (hit && hit.hit && hit.pickedPoint) {
      return hit.pickedPoint;
    }

    return Vector3.Zero();
  }

  /**
   * Get distance between two points
   */
  private getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Emit event to all registered handlers
   */
  private emitEvent(event: InputEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Register event handler
   */
  on(eventType: InputEventType, handler: InputEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(eventType: InputEventType, handler: InputEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Remove all handlers for an event type
   */
  removeAllHandlers(eventType: InputEventType): void {
    this.eventHandlers.delete(eventType);
  }

  /**
   * Check if currently dragging
   */
  isDraggingActive(): boolean {
    return this.isDragging;
  }

  /**
   * Check if currently pinching
   */
  isPinchingActive(): boolean {
    return this.isPinching;
  }

  /**
   * Get drag start position
   */
  getDragStartPosition(): Vector3 {
    return this.dragStartPosition.clone();
  }

  /**
   * Get drag delta
   */
  getDragDelta(): Vector3 {
    return this.dragCurrentPosition.subtract(this.dragStartPosition);
  }

  /**
   * Dispose input manager
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    // Remove all event handlers
    this.eventHandlers.clear();

    // Dispose ground plane
    if (this.groundPlane) {
      this.groundPlane.dispose();
      this.groundPlane = null;
    }
  }
}
