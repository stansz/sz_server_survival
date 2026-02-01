import { Vector3 } from '@babylonjs/core';

/**
 * Traffic and enemy types
 */

export enum TrafficType {
  STATIC = 'static',
  READ = 'read',
  WRITE = 'write',
  UPLOAD = 'upload',
  SEARCH = 'search',
  MALICIOUS = 'malicious'
}

export interface TrafficConfig {
  type: TrafficType;
  health: number;
  speed: number;
  reward: number;
  damage: number;
  color: string;
  model?: string;
}

export interface TrafficEntityData {
  id: string;
  type: TrafficType;
  position: Vector3;
  path: Vector3[];
  health: number;
  maxHealth: number;
  speed: number;
  config: TrafficConfig;
}
