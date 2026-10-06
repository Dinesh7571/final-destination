/**
 * Station utility functions
 */

/**
 * Format station label e.g., "PRAYAGRAJ JN (PRYJ)"
 */
export function formatStationLabel(station) {
  if (!station) return '';
  if (typeof station === 'string') return station;
  return `${station.name || station.code} (${station.code})`;
}

/**
 * Calculate distance between two station indexes in schedule
 */
export function calculateSegmentDistance(fromStn, toStn) {
  if (!fromStn || !toStn) return 0;
  const dist1 = Number(fromStn.distance) || 0;
  const dist2 = Number(toStn.distance) || 0;
  return Math.max(0, dist2 - dist1);
}

/**
 * Class code descriptions
 */
export const CLASS_NAMES = {
  '1A': 'AC First Class (1A)',
  '2A': 'AC 2 Tier (2A)',
  '3A': 'AC 3 Tier (3A)',
  '3E': 'AC 3 Tier Economy (3E)',
  'SL': 'Sleeper (SL)',
  'CC': 'AC Chair Car (CC)',
  'EC': 'Exec. Chair Car (EC)'
};

/**
 * Berth type descriptions
 */
export const BERTH_TYPES = {
  'L': 'Lower Berth',
  'LB': 'Lower Berth',
  'M': 'Middle Berth',
  'MB': 'Middle Berth',
  'U': 'Upper Berth',
  'UB': 'Upper Berth',
  'SL': 'Side Lower',
  'SU': 'Side Upper',
  'SM': 'Side Middle',
  'CB': 'Cabin Berth',
  'CP': 'Coupe'
};

export function getBerthTypeName(code) {
  if (!code) return 'Berth';
  return BERTH_TYPES[code.toUpperCase()] || `${code} Berth`;
}
