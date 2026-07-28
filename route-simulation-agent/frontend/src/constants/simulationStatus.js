/**
 * simulationStatus.js
 * All possible states in the shipment route simulation lifecycle.
 */

export const SIM_STATUS = {
  ACCEPTED:          'Accepted',
  PICKUP_STARTED:    'Pickup Started',
  IN_TRANSIT:        'In Transit',
  NEAR_DESTINATION:  'Near Destination',
  REACHED:           'Completed',
  COMPLETED:         'Completed',
};

// Ordered list used to progress through statuses
export const STATUS_ORDER = [
  SIM_STATUS.ACCEPTED,
  SIM_STATUS.PICKUP_STARTED,
  SIM_STATUS.IN_TRANSIT,
  SIM_STATUS.NEAR_DESTINATION,
  SIM_STATUS.REACHED,
];

// Progress thresholds at which status automatically advances
export const STATUS_THRESHOLDS = {
  [SIM_STATUS.ACCEPTED]:         0,
  [SIM_STATUS.PICKUP_STARTED]:   5,
  [SIM_STATUS.IN_TRANSIT]:       15,
  [SIM_STATUS.NEAR_DESTINATION]: 80,
  [SIM_STATUS.REACHED]:          100,
};
