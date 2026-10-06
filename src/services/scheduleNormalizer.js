/**
 * Schedule Normalizer Service
 * Ensures raw train schedule data is transformed into a standardized, indexed array.
 */

/**
 * Normalizes raw schedule array from API or fallback
 * @param {Array} rawSchedule 
 * @returns {Array} Array of normalized station objects sorted by route order
 */
export function normalizeSchedule(rawSchedule) {
  if (!Array.isArray(rawSchedule) || rawSchedule.length === 0) {
    return [];
  }

  // Sort raw list by serial number or distance if available
  const sorted = [...rawSchedule].sort((a, b) => {
    const serialA = Number(a.seq || a.stnSerialNumber || a.serialNo || a.srNo || a.index || 0);
    const serialB = Number(b.seq || b.stnSerialNumber || b.serialNo || b.srNo || b.index || 0);
    if (serialA !== serialB) return serialA - serialB;
    const distA = Number(a.distance || 0);
    const distB = Number(b.distance || 0);
    return distA - distB;
  });

  return sorted.map((stn, idx) => {
    const code = String(stn.stationCode || stn.code || stn.stnCode || '').toUpperCase().trim();
    const name = String(stn.stationName || stn.name || stn.stnName || code).toUpperCase().trim();
    const serial = Number(stn.seq || stn.stnSerialNumber || stn.serialNo || stn.srNo || idx + 1);
    const distance = Number(stn.distance || 0);
    const day = Number(stn.day_count || stn.dayCount || stn.day || 1);
    const arrival = stn.arrivalTime || stn.arrival || stn.arrTime || '--:--';
    const departure = stn.departureTime || stn.departure || stn.depTime || '--:--';
    // Real API sends boardingDisabled as the STRING "false" / "true".
    // Boolean("false") === true in JS — so we must compare against the string explicitly.
    const rawDisabled = stn.boardingDisabled ?? stn.isDisabled ?? false;
    const boardingDisabled = rawDisabled === true || rawDisabled === 'true' || rawDisabled === 1;

    return {
      code,
      name,
      index: idx, // 0-based sequential route index
      serial,
      distance,
      day,
      arrival,
      departure,
      boardingAllowed: !boardingDisabled
    };
  });
}

/**
 * Creates a Map for O(1) lookup of station details and index by Station Code
 * @param {Array} normalizedSchedule 
 * @returns {Map<string, Object>} Code -> Station object
 */
export function createStationMap(normalizedSchedule) {
  const map = new Map();
  if (Array.isArray(normalizedSchedule)) {
    normalizedSchedule.forEach(stn => {
      map.set(stn.code, stn);
    });
  }
  return map;
}
