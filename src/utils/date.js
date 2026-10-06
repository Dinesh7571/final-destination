/**
 * Date & Time utility functions for Indian Railways Journey Search
 */

/**
 * Format a Date object or date string into YYYY-MM-DD (ISO date string)
 * @param {Date|string} date 
 * @returns {string} e.g. "2026-10-06"
 */
export function formatDateToISO(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for user display e.g. "06 Oct 2026"
 * @param {string|Date} date 
 * @returns {string} e.g. "06 Oct 2026"
 */
export function formatDateDisplay(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get default journey date (today)
 * @returns {string} ISO date string
 */
export function getDefaultJourneyDate() {
  const today = new Date();
  return formatDateToISO(today);
}

/**
 * Minimum valid date for prepared charts:
 * In IRCTC, trains en route run up to 2-3 days. Charts older than 2 days
 * have completed their journeys and are no longer active on the chart API.
 * @returns {string} ISO date string for (today - 2 days)
 */
export function getMinChartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return formatDateToISO(d);
}

/**
 * Maximum valid date for prepared charts:
 * IRCTC charts are prepared ~4 to 8 hours before departure.
 * Dates beyond tomorrow (+1 day) cannot have prepared charts yet.
 * @returns {string} ISO date string for (today + 1 day)
 */
export function getMaxChartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateToISO(d);
}

/**
 * Calculate station arrival/departure date given train start date and schedule day count
 * e.g. baseDate "2026-10-06" + dayCount 2 -> "Wed, 07 Oct"
 * @param {string} baseDateStr ISO date string (YYYY-MM-DD)
 * @param {number} dayCount 1-based day count of the train route
 * @returns {string} e.g. "Wed, 07 Oct"
 */
export function calculateStationDate(baseDateStr, dayCount = 1) {
  if (!baseDateStr) return '';
  const parts = String(baseDateStr).split('-');
  if (parts.length < 3) return '';
  
  // Use UTC/local year, month-1, day to avoid timezone drift
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  const offset = Math.max(0, Number(dayCount || 1) - 1);
  d.setDate(d.getDate() + offset);

  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
}

/**
 * Calculate travel duration between departure and arrival station stops
 * @param {string} depTime e.g. "14:30"
 * @param {number} depDay e.g. 2
 * @param {string} arrTime e.g. "23:30"
 * @param {number} arrDay e.g. 2
 * @returns {string} e.g. "9h" or "9h 25m"
 */
export function calculateDuration(depTime, depDay = 1, arrTime, arrDay = 1) {
  if (!depTime || !arrTime || depTime.includes('-') || arrTime.includes('-')) return '';
  const depParts = depTime.split(':').map(Number);
  const arrParts = arrTime.split(':').map(Number);
  if (depParts.length < 2 || arrParts.length < 2) return '';
  if (isNaN(depParts[0]) || isNaN(depParts[1]) || isNaN(arrParts[0]) || isNaN(arrParts[1])) return '';

  const depMinutes = ((Number(depDay || 1) - 1) * 24 * 60) + (depParts[0] * 60) + depParts[1];
  const arrMinutes = ((Number(arrDay || 1) - 1) * 24 * 60) + (arrParts[0] * 60) + arrParts[1];
  const diffMinutes = arrMinutes - depMinutes;

  if (diffMinutes <= 0) return '';
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
}
