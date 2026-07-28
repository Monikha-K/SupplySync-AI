/**
 * progressCalculator.js
 * Pure functions for computing simulation progress and distances.
 */

/**
 * Calculate remaining distance based on progress percentage.
 * @param {number} totalDistance - Total route distance in km
 * @param {number} progressPct   - Current progress (0–100)
 * @returns {number} Remaining distance in km (rounded to 1 decimal)
 */
export function calcRemainingDistance(totalDistance, progressPct) {
  const remaining = totalDistance * (1 - progressPct / 100);
  return Math.max(0, Math.round(remaining * 10) / 10);
}

/**
 * Interpolate a coordinate along a polyline given a progress fraction.
 * @param {Array<[lat,lng]>} coords - Array of [lat, lng] waypoints
 * @param {number} fraction         - 0.0 to 1.0
 * @returns {[lat, lng]}
 */
export function interpolatePosition(coords, fraction) {
  if (!coords || coords.length < 2) return coords?.[0] ?? [0, 0];

  const clampedFraction = Math.min(1, Math.max(0, fraction));

  // Calculate total path length
  let totalLength = 0;
  const segmentLengths = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const d = segmentDistance(coords[i], coords[i + 1]);
    segmentLengths.push(d);
    totalLength += d;
  }

  const targetLength = clampedFraction * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    if (accumulated + segmentLengths[i] >= targetLength) {
      const segFraction = (targetLength - accumulated) / segmentLengths[i];
      const [lat1, lng1] = coords[i];
      const [lat2, lng2] = coords[i + 1];
      return [
        lat1 + (lat2 - lat1) * segFraction,
        lng1 + (lng2 - lng1) * segFraction,
      ];
    }
    accumulated += segmentLengths[i];
  }

  return coords[coords.length - 1];
}

/**
 * Euclidean distance approximation between two [lat, lng] points.
 */
function segmentDistance([lat1, lng1], [lat2, lng2]) {
  return Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2);
}
