import { GameMode, GameConfig } from '../types/game.types';

/**
 * Game configuration settings
 */
export const GAME_CONFIG: Record<GameMode, GameConfig> = {
  [GameMode.SURVIVAL]: {
    mode: GameMode.SURVIVAL,
    startingBudget: 500,
    startingReputation: 100,
    maxReputation: 100,
    minBudget: -1000,
  },
  [GameMode.SANDBOX]: {
    mode: GameMode.SANDBOX,
    startingBudget: 10000,
    startingReputation: 100,
    maxReputation: 100,
    minBudget: -Infinity, // No bankruptcy in sandbox
  },
};

/**
 * Wave configuration for survival mode
 */
export interface WaveConfig {
  waveNumber: number;
  rps: number; // Requests per second
  duration: number; // Duration in seconds
  trafficMix: {
    static: number;
    read: number;
    write: number;
    upload: number;
    search: number;
    malicious: number;
  };
}

/**
 * Generate wave configuration based on game time
 */
export function getWaveConfig(gameTime: number): WaveConfig {
  const waveNumber = Math.floor(gameTime / 60) + 1;
  
  // RPS acceleration: ×1.3 at 1min → ×4.0 at 10min
  const rpsMultiplier = Math.min(4.0, 1.3 + (gameTime / 60) * 0.3);
  const baseRps = 5;
  const rps = Math.floor(baseRps * rpsMultiplier);
  
  // Traffic mix shifts over time
  const maliciousRatio = Math.min(0.3, 0.05 + (gameTime / 600)); // Up to 30% malicious
  const remainingRatio = 1 - maliciousRatio;
  
  return {
    waveNumber,
    rps,
    duration: 60, // 1 minute waves
    trafficMix: {
      static: remainingRatio * 0.3,
      read: remainingRatio * 0.25,
      write: remainingRatio * 0.15,
      upload: remainingRatio * 0.1,
      search: remainingRatio * 0.2,
      malicious: maliciousRatio,
    },
  };
}

/**
 * Random event configuration
 */
export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in seconds
  effect: {
    type: 'traffic-surge' | 'ddos-attack' | 'service-degradation' | 'budget-bonus';
    value: number;
  };
}

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'traffic-surge',
    name: 'Traffic Surge',
    description: 'Sudden increase in legitimate traffic',
    duration: 15,
    effect: {
      type: 'traffic-surge',
      value: 2.0, // 2x traffic
    },
  },
  {
    id: 'ddos-attack',
    name: 'DDoS Attack',
    description: 'Distributed denial of service attack!',
    duration: 10,
    effect: {
      type: 'ddos-attack',
      value: 5.0, // 5x malicious traffic
    },
  },
  {
    id: 'service-degradation',
    name: 'Service Degradation',
    description: 'Services are experiencing issues',
    duration: 20,
    effect: {
      type: 'service-degradation',
      value: 0.5, // 50% effectiveness
    },
  },
  {
    id: 'budget-bonus',
    name: 'Client Bonus',
    description: 'Happy clients sent extra payment',
    duration: 0,
    effect: {
      type: 'budget-bonus',
      value: 200, // +$200
    },
  },
];
