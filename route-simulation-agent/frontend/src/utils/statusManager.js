/**
 * statusManager.js
 * Determines the current simulation status from the progress percentage.
 */
import { SIM_STATUS, STATUS_ORDER, STATUS_THRESHOLDS } from '../constants/simulationStatus.js';

/**
 * Derive the simulation status from current progress.
 * @param {number} progress - 0 to 100
 * @returns {string} One of SIM_STATUS values
 */
export function getStatusFromProgress(progress) {
  let currentStatus = SIM_STATUS.ACCEPTED;

  for (const status of STATUS_ORDER) {
    if (progress >= STATUS_THRESHOLDS[status]) {
      currentStatus = status;
    }
  }

  return currentStatus;
}

/**
 * Returns a CSS class name to colour the status chip.
 * @param {string} status
 * @returns {string}
 */
export function getStatusVariant(status) {
  switch (status) {
    case SIM_STATUS.ACCEPTED:         return 'status-accepted';
    case SIM_STATUS.PICKUP_STARTED:   return 'status-pickup';
    case SIM_STATUS.IN_TRANSIT:       return 'status-transit';
    case SIM_STATUS.NEAR_DESTINATION: return 'status-near';
    case SIM_STATUS.REACHED:
    case 'Completed':
    case 'Reached':                   return 'status-reached';
    default:                          return 'status-accepted';
  }
}

/**
 * Get an emoji icon matching the current status.
 * @param {string} status
 * @returns {string}
 */
export function getStatusIcon(status) {
  switch (status) {
    case SIM_STATUS.ACCEPTED:         return '📋';
    case SIM_STATUS.PICKUP_STARTED:   return '📦';
    case SIM_STATUS.IN_TRANSIT:       return '🚚';
    case SIM_STATUS.NEAR_DESTINATION: return '📍';
    case SIM_STATUS.REACHED:
    case 'Completed':
    case 'Reached':                   return '✅';
    default:                          return '⏳';
  }
}
