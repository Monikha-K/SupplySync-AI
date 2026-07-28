/**
 * etaCalculator.js
 * Computes remaining ETA based on progress and current event modifiers.
 */

/**
 * Calculate remaining ETA in hours.
 * @param {number} totalEtaHours  - Original ETA from shipment data
 * @param {number} progressPct    - Current progress (0–100)
 * @param {number} etaMultiplier  - Extra multiplier from active event (default 1)
 * @returns {string} Formatted ETA string e.g. "2h 30m"
 */
export function calcRemainingETA(totalEtaHours, progressPct, etaMultiplier = 1) {
  if (progressPct >= 100) return '0m';

  const fractionLeft = 1 - progressPct / 100;
  const remainingHours = totalEtaHours * fractionLeft * etaMultiplier;

  return formatETA(remainingHours);
}

/**
 * Format decimal hours into a human-readable string.
 * @param {number} hours
 * @returns {string}
 */
export function formatETA(hours) {
  if (hours <= 0) return '0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculate total elapsed time since simulation started.
 * @param {Date} startTime
 * @returns {string}
 */
export function calcElapsedTime(startTime) {
  if (!startTime) return '0m';
  const diffMs = Date.now() - new Date(startTime).getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
