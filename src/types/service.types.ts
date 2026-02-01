import { Vector3 } from '@babylonjs/core';

/**
 * Service and tower types
 */

export enum ServiceType {
  FIREWALL = 'firewall',
  CDN = 'cdn',
  LOAD_BALANCER = 'load_balancer',
  CACHE = 'cache',
  DATABASE = 'database',
  AUTO_SCALER = 'auto_scaler'
}

export interface ServiceConfig {
  type: ServiceType;
  name: string;
  description: string;
  cost: number;
  range: number;
  damage: number;
  attackSpeed: number;
  health: number;
  maxHealth: number;
  upkeep: number;
  color: string;
  model?: string;
  levels: ServiceLevel[];
}

export interface ServiceLevel {
  level: number;
  cost: number;
  range: number;
  damage: number;
  attackSpeed: number;
  health: number;
  maxHealth: number;
  upkeep: number;
}

export interface ServiceEntityData {
  id: string;
  type: ServiceType;
  position: Vector3;
  gridPosition: { x: number; z: number };
  level: number;
  health: number;
  maxHealth: number;
  config: ServiceConfig;
  targets: string[];
  lastAttackTime: number;
}
