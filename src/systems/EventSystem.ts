import { eventBus } from '../utils/EventBus';
import { RANDOM_EVENTS } from '../config/game.config';

/**
 * EventSystem - Manages random game events
 */
export class EventSystem {
  private activeEvent: string | null = null;
  private eventTimer: number = 0;
  private eventInterval: number = 30; // Check for events every 30 seconds
  private minInterval: number = 15; // Minimum 15 seconds between events
  private maxInterval: number = 45; // Maximum 45 seconds between events

  constructor() {
    // Subscribe to events
    eventBus.on('event-triggered', ({ eventId, duration }) => {
      this.activeEvent = eventId;

      // Auto-end event after duration
      setTimeout(() => {
        this.endEvent();
      }, duration * 1000);
    });

    eventBus.on('event-ended', ({ eventId }) => {
      if (this.activeEvent === eventId) {
        this.activeEvent = null;
      }
    });
  }

  /**
   * Update event system - called each frame
   */
  update(deltaTime: number): void {
    // Don't trigger events if one is already active
    if (this.activeEvent) {
      return;
    }

    // Check for new event
    this.eventTimer += deltaTime;
    if (this.eventTimer >= this.eventInterval) {
      this.triggerRandomEvent();
      this.eventTimer = 0;
    }
  }

  /**
   * Trigger a random event
   */
  private triggerRandomEvent(): void {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];

    // Emit event
    eventBus.emit('event-triggered', {
      eventId: event.id,
      duration: event.duration,
    });

    console.log(`Event triggered: ${event.name} - ${event.description}`);
  }

  /**
   * End the current event
   */
  private endEvent(): void {
    if (this.activeEvent) {
      const eventId = this.activeEvent;

      eventBus.emit('event-ended', { eventId });

      console.log(`Event ended: ${eventId}`);
    }
  }

  /**
   * Get active event
   */
  getActiveEvent(): string | null {
    return this.activeEvent;
  }

  /**
   * Get event by ID
   */
  getEventById(eventId: string): any {
    return RANDOM_EVENTS.find((e) => e.id === eventId);
  }

  /**
   * Set event interval
   */
  setEventInterval(interval: number): void {
    this.eventInterval = Math.max(this.minInterval, Math.min(this.maxInterval, interval));
  }

  /**
   * Reset event system
   */
  reset(): void {
    this.activeEvent = null;
    this.eventTimer = 0;
  }

  /**
   * Dispose system
   */
  dispose(): void {
    // Cleanup if needed
  }
}
