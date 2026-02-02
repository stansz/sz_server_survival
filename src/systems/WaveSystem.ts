import { eventBus } from '../utils/EventBus';
import { getWaveConfig } from '../config/game.config';

/**
 * WaveSystem - Manages wave progression and escalation
 */
export class WaveSystem {
  private gameTime: number = 0;
  private currentWave: number = 1;
  private waveTimer: number = 0;
  private waveDuration: number = 60; // 60 seconds per wave
  private eventTimer: number = 0;
  private eventInterval: number = 30; // Random event every 30 seconds
  private activeEvent: string | null = null;

  constructor() {
    // Subscribe to events
    eventBus.on('event-triggered', ({ eventId, duration }) => {
      this.activeEvent = eventId;
      setTimeout(() => {
        this.activeEvent = null;
        eventBus.emit('event-ended', { eventId });
      }, duration * 1000);
    });
  }

  /**
   * Update wave system - called each frame
   */
  update(deltaTime: number): void {
    this.gameTime += deltaTime;

    // Wave timer
    this.waveTimer += deltaTime;
    if (this.waveTimer >= this.waveDuration) {
      this.startNewWave();
      this.waveTimer = 0;
    }

    // Random event timer
    this.eventTimer += deltaTime;
    if (this.eventTimer >= this.eventInterval) {
      this.triggerRandomEvent();
      this.eventTimer = 0;
    }
  }

  /**
   * Start a new wave
   */
  private startNewWave(): void {
    const waveConfig = getWaveConfig(this.gameTime);
    this.currentWave = waveConfig.waveNumber;

    eventBus.emit('wave-started', {
      wave: this.currentWave,
      rps: waveConfig.rps,
    });

    console.log(`Wave ${this.currentWave} started! RPS: ${waveConfig.rps}`);
  }

  /**
   * Trigger a random event
   */
  private triggerRandomEvent(): void {
    const events = [
      'traffic-surge',
      'ddos-attack',
      'service-degradation',
      'budget-bonus',
    ];

    // Filter out active event
    const availableEvents = events.filter((e) => e !== this.activeEvent);

    if (availableEvents.length === 0) {
      return;
    }

    const eventId = availableEvents[Math.floor(Math.random() * availableEvents.length)];

    // Get event duration
    const durations: Record<string, number> = {
      'traffic-surge': 15,
      'ddos-attack': 10,
      'service-degradation': 20,
      'budget-bonus': 0,
    };

    eventBus.emit('event-triggered', {
      eventId,
      duration: durations[eventId],
    });

    console.log(`Event triggered: ${eventId}`);
  }

  /**
   * Start wave system
   */
  start(): void {
    // Wave system starts automatically in update()
    // This method is for explicit start if needed
  }

  /**
   * Get current wave number
   */
  getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Get game time
   */
  getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Get active event
   */
  getActiveEvent(): string | null {
    return this.activeEvent;
  }

  /**
   * Reset wave system
   */
  reset(): void {
    this.gameTime = 0;
    this.currentWave = 1;
    this.waveTimer = 0;
    this.eventTimer = 0;
    this.activeEvent = null;
  }

  /**
   * Dispose system
   */
  dispose(): void {
    // Cleanup if needed
  }
}
