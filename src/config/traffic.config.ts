import { TrafficType, TrafficConfig } from '../types/traffic.types';

/**
 * Traffic configurations
 */
export const TRAFFIC_CONFIG: Record<TrafficType, TrafficConfig> = {
  [TrafficType.STATIC]: {
    type: TrafficType.STATIC,
    health: 10,
    speed: 1.0,
    reward: 5,
    damage: 1,
    color: '#4CAF50',
  },
  [TrafficType.READ]: {
    type: TrafficType.READ,
    health: 15,
    speed: 0.8,
    reward: 8,
    damage: 2,
    color: '#2196F3',
  },
  [TrafficType.WRITE]: {
    type: TrafficType.WRITE,
    health: 20,
    speed: 0.6,
    reward: 12,
    damage: 3,
    color: '#FF9800',
  },
  [TrafficType.UPLOAD]: {
    type: TrafficType.UPLOAD,
    health: 25,
    speed: 0.4,
    reward: 15,
    damage: 4,
    color: '#9C27B0',
  },
  [TrafficType.SEARCH]: {
    type: TrafficType.SEARCH,
    health: 18,
    speed: 0.7,
    reward: 10,
    damage: 2,
    color: '#00BCD4',
  },
  [TrafficType.MALICIOUS]: {
    type: TrafficType.MALICIOUS,
    health: 50,
    speed: 1.2,
    reward: 25,
    damage: 10,
    color: '#F44336',
  },
};

/**
 * Default traffic mix for sandbox mode
 */
export const DEFAULT_TRAFFIC_MIX = {
  static: 0.3,
  read: 0.25,
  write: 0.15,
  upload: 0.1,
  search: 0.2,
  malicious: 0.0,
};

/**
 * Get random traffic type based on mix ratios
 */
export function getRandomTrafficType(
  mix: typeof DEFAULT_TRAFFIC_MIX
): TrafficType {
  const random = Math.random();
  let cumulative = 0;

  if (random < (cumulative += mix.static)) return TrafficType.STATIC;
  if (random < (cumulative += mix.read)) return TrafficType.READ;
  if (random < (cumulative += mix.write)) return TrafficType.WRITE;
  if (random < (cumulative += mix.upload)) return TrafficType.UPLOAD;
  if (random < (cumulative += mix.search)) return TrafficType.SEARCH;
  return TrafficType.MALICIOUS;
}
