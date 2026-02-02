import { eventBus } from '../utils/EventBus';
import { ServiceEntityData } from '../types/service.types';

/**
 * HealthSystem - Manages service health and repairs
 */
export class HealthSystem {
  private services: Map<string, ServiceEntityData> = new Map();
  private degradationRate: number = 0.1; // Health lost per second under load

  constructor() {
    // Subscribe to events
    eventBus.on('service-placed', () => {
      // Track service placement
    });

    eventBus.on('event-triggered', ({ eventId, duration }) => {
      this.handleEvent(eventId, duration);
    });
  }

  /**
   * Register a service with the health system
   */
  registerService(service: ServiceEntityData): void {
    this.services.set(service.id, service);
  }

  /**
   * Unregister a service from the health system
   */
  unregisterService(serviceId: string): void {
    this.services.delete(serviceId);
  }

  /**
   * Update health system - called each frame
   */
  update(deltaTime: number): void {
    // Apply degradation to all services
    this.services.forEach((service) => {
      // Services degrade over time
      if (service.health > 0) {
        const degradation = this.degradationRate * deltaTime;
        service.health = Math.max(0, service.health - degradation);

        // Check if service failed
        if (service.health <= 0) {
          this.handleServiceFailure(service.id);
        }
      }
    });
  }

  /**
   * Repair a service
   */
  repairService(serviceId: string, amount: number): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;

    // Apply repair
    service.health = Math.min(service.maxHealth, service.health + amount);

    console.log(`Repaired service ${serviceId} by ${amount} health`);

    return true;
  }

  /**
   * Handle service failure
   */
  private handleServiceFailure(serviceId: string): void {
    eventBus.emit('service-failed', { serviceId });
    console.log(`Service ${serviceId} failed!`);

    // Remove from tracking
    this.services.delete(serviceId);
  }

  /**
   * Handle random events
   */
  private handleEvent(eventId: string, duration: number): void {
    if (eventId === 'service-degradation') {
      // Increase degradation rate temporarily
      const originalRate = this.degradationRate;
      this.degradationRate *= 2.0;

      setTimeout(() => {
        this.degradationRate = originalRate;
      }, duration * 1000);
    }
  }

  /**
   * Get service health
   */
  getServiceHealth(serviceId: string): number | undefined {
    const service = this.services.get(serviceId);
    return service?.health;
  }

  /**
   * Get service health percentage
   */
  getServiceHealthPercentage(serviceId: string): number | undefined {
    const service = this.services.get(serviceId);
    if (!service) return undefined;
    return (service.health / service.maxHealth) * 100;
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceEntityData[] {
    return Array.from(this.services.values());
  }

  /**
   * Get services that need repair
   */
  getServicesNeedingRepair(threshold: number = 50): ServiceEntityData[] {
    return Array.from(this.services.values()).filter(
      (service) => (service.health / service.maxHealth) * 100 < threshold
    );
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * Reset health system
   */
  reset(): void {
    this.services.clear();
  }

  /**
   * Dispose system
   */
  dispose(): void {
    this.services.clear();
  }
}
