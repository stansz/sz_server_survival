import { eventBus } from '../utils/EventBus';
import { GameResources, GameStats } from '../types/game.types';
import { GameMode } from '../types/game.types';

/**
 * EconomySystem - Manages budget, reputation, and scoring
 */
export class EconomySystem {
  private resources: GameResources;
  private stats: GameStats;
  private mode: GameMode;
  private upkeepTimer: number = 0;
  private upkeepInterval: number = 10; // Check upkeep every 10 seconds

  constructor(mode: GameMode, startingBudget: number, startingReputation: number) {
    this.mode = mode;
    this.resources = {
      budget: startingBudget,
      reputation: startingReputation,
    };
    this.stats = {
      requestsProcessed: 0,
      attacksBlocked: 0,
      servicesBuilt: 0,
      playTime: 0,
    };

    // Subscribe to events
    eventBus.on('traffic-processed', ({ type: _type, reward }) => {
      this.addFunds(reward);
      this.stats.requestsProcessed++;
    });

    eventBus.on('traffic-leaked', ({ type: _type, damage }) => {
      this.loseReputation(damage);
    });

    eventBus.on('service-placed', () => {
      this.stats.servicesBuilt++;
    });

    eventBus.on('event-triggered', ({ eventId, duration: _duration }) => {
      this.handleEvent(eventId);
    });
  }

  /**
   * Update economy system - called each frame
   */
  update(deltaTime: number): void {
    this.stats.playTime += deltaTime;

    // Check upkeep periodically
    this.upkeepTimer += deltaTime;
    if (this.upkeepTimer >= this.upkeepInterval) {
      this.processUpkeep();
      this.upkeepTimer = 0;
    }

    // Check game over conditions
    this.checkGameOver();
  }

  /**
   * Add funds to budget
   */
  addFunds(amount: number): void {
    this.resources.budget += amount;

    eventBus.emit('budget-changed', {
      newBudget: this.resources.budget,
      delta: amount,
    });
  }

  /**
   * Remove funds from budget
   */
  spendFunds(amount: number): boolean {
    if (this.resources.budget < amount) {
      return false;
    }

    this.resources.budget -= amount;

    eventBus.emit('budget-changed', {
      newBudget: this.resources.budget,
      delta: -amount,
    });

    return true;
  }

  /**
   * Add reputation
   */
  addReputation(amount: number): void {
    this.resources.reputation = Math.min(100, this.resources.reputation + amount);

    eventBus.emit('reputation-changed', {
      newReputation: this.resources.reputation,
      delta: amount,
    });
  }

  /**
   * Lose reputation
   */
  loseReputation(amount: number): void {
    this.resources.reputation = Math.max(0, this.resources.reputation - amount);

    eventBus.emit('reputation-changed', {
      newReputation: this.resources.reputation,
      delta: -amount,
    });
  }

  /**
   * Process upkeep costs
   */
  private processUpkeep(): void {
    const totalUpkeep = this.calculateUpkeep();

    if (totalUpkeep > 0) {
      this.spendFunds(totalUpkeep);
    }
  }

  /**
   * Calculate total upkeep cost
   */
  private calculateUpkeep(): number {
    // This would be calculated from active services
    // For now, return a placeholder value
    return 0;
  }

  /**
   * Handle random events
   */
  private handleEvent(eventId: string): void {
    if (eventId === 'budget-bonus') {
      this.addFunds(200);
    }
  }

  /**
   * Check game over conditions
   */
  private checkGameOver(): void {
    if (this.mode === GameMode.SANDBOX) {
      return; // No game over in sandbox
    }

    // Check reputation
    if (this.resources.reputation <= 0) {
      eventBus.emit('game-over', {
        reason: 'reputation',
        score: this.calculateScore(),
      });
    }

    // Check bankruptcy
    if (this.resources.budget < -1000) {
      eventBus.emit('game-over', {
        reason: 'bankruptcy',
        score: this.calculateScore(),
      });
    }
  }

  /**
   * Calculate final score
   */
  private calculateScore(): number {
    const timeBonus = Math.floor(this.stats.playTime / 10);
    const requestBonus = this.stats.requestsProcessed * 10;
    const attackBonus = this.stats.attacksBlocked * 50;

    return timeBonus + requestBonus + attackBonus;
  }

  /**
   * Get current resources
   */
  getResources(): GameResources {
    return { ...this.resources };
  }

  /**
   * Get current stats
   */
  getStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * Reset economy
   */
  reset(): void {
    this.resources = {
      budget: 500,
      reputation: 100,
    };
    this.stats = {
      requestsProcessed: 0,
      attacksBlocked: 0,
      servicesBuilt: 0,
      playTime: 0,
    };
    this.upkeepTimer = 0;
  }

  /**
   * Dispose system
   */
  dispose(): void {
    // Cleanup if needed
  }
}
