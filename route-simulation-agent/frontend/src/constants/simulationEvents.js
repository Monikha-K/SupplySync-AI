/**
 * simulationEvents.js
 * Defines simulation disruption events and their effects on speed.
 */

export const SIM_EVENTS = {
  TRAFFIC: {
    id: 'TRAFFIC',
    label: 'Traffic',
    icon: '🚦',
    description: 'Heavy traffic ahead. Speed reduced.',
    speedMultiplier: 0.5,   // 50% speed
    etaMultiplier: 1.8,
    color: '#F59E0B',
  },
  HEAVY_RAIN: {
    id: 'HEAVY_RAIN',
    label: 'Heavy Rain',
    icon: '🌧️',
    description: 'Heavy rain affecting road conditions.',
    speedMultiplier: 0.4,
    etaMultiplier: 2.2,
    color: '#06B6D4',
  },
  ROAD_BLOCK: {
    id: 'ROAD_BLOCK',
    label: 'Road Block',
    icon: '🚧',
    description: 'Road block detected. Vehicle rerouting.',
    speedMultiplier: 0.2,
    etaMultiplier: 3.0,
    color: '#EF4444',
  },
  VEHICLE_BREAKDOWN: {
    id: 'VEHICLE_BREAKDOWN',
    label: 'Vehicle Breakdown',
    icon: '🔧',
    description: 'Vehicle breakdown. Awaiting assistance.',
    speedMultiplier: 0.0,   // vehicle stopped
    etaMultiplier: 0,       // unknown
    color: '#EF4444',
  },
};

// Base progress increment per tick (at 1x speed, in % per second)
export const BASE_PROGRESS_RATE = 0.3;

// Speed multipliers for simulation speed buttons
export const SPEED_MULTIPLIERS = {
  '1x': 1,
  '2x': 2,
  '4x': 4,
};
