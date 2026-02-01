/**
 * Game state and configuration types
 */

export enum GameMode {
  SURVIVAL = 'survival',
  SANDBOX = 'sandbox'
}

export enum GameState {
  BOOT = 'boot',
  MENU = 'menu',
  GAME = 'game',
  PAUSE = 'pause',
  GAME_OVER = 'game_over'
}

export interface GameResources {
  budget: number;
  reputation: number;
}

export interface GameStats {
  requestsProcessed: number;
  attacksBlocked: number;
  servicesBuilt: number;
  playTime: number;
}

export interface GameConfig {
  mode: GameMode;
  startingBudget: number;
  startingReputation: number;
  maxReputation: number;
  minBudget: number;
}

export interface GameSave {
  version: string;
  timestamp: number;
  config: GameConfig;
  resources: GameResources;
  stats: GameStats;
  state: GameState;
}
