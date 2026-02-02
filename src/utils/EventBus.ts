import { Vector3 } from '@babylonjs/core';
import { TrafficType } from '../types/traffic.types';
import { ServiceType } from '../types/service.types';

/**
 * Type-safe event map for game events
 */
export type GameEventMap = {
  'traffic-processed': { type: TrafficType; reward: number };
  'traffic-leaked': { type: TrafficType; damage: number };
  'service-selected': { serviceId: string; serviceType: ServiceType };
  'service-placed': { position: Vector3; type: ServiceType };
  'service-upgraded': { serviceId: string; newLevel: number };
  'service-failed': { serviceId: string };
  'wave-started': { wave: number; rps: number };
  'wave-completed': { wave: number };
  'game-over': { reason: string; score?: number };
  'budget-changed': { newBudget: number; delta: number };
  'reputation-changed': { newReputation: number; delta: number };
  'event-triggered': { eventId: string; duration: number };
  'event-ended': { eventId: string };
  // Scene management events
  'boot-complete': {};
  'game-start': { mode: string };
  'game-paused': {};
  'game-resumed': {};
  'pause-resume': {};
  'pause-restart': {};
  'pause-quit': {};
  'gameover-restart': {};
  'gameover-menu': {};
  'sandbox-start': { settings: any };
  'sandbox-menu': {};
  'mode-selected': { mode: string };
  'grid-clicked': { position: Vector3 };
};

export type GameEvent = keyof GameEventMap;

/**
 * EventBus - Type-safe event emitter for game systems
 * Provides decoupled communication between game systems
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<GameEvent, Set<((data: any) => void)>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit an event with typed data
   */
  emit<K extends GameEvent>(event: K, data: GameEventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event with typed callback
   * Returns unsubscribe function
   */
  on<K extends GameEvent>(
    event: K,
    callback: (data: GameEventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (data: any) => void);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as (data: any) => void);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends GameEvent>(event: K, callback: (data: GameEventMap[K]) => void): void {
    this.listeners.get(event)?.delete(callback as (data: any) => void);
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Global singleton instance
export const eventBus = EventBus.getInstance();
