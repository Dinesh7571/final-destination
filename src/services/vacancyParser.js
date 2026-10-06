/**
 * Vacancy Parser Service — Real IRCTC bdd/bsd Format
 *
 * KEY RULES from actual API:
 *  enable: true  → bsd lists only the OCCUPIED portions.
 *                  Gaps within [berth.from → berth.to] that are NOT in bsd = VACANT.
 *  enable: false → bsd lists ALL segments explicitly (both occupied and vacant).
 *                  Just read occupancy: false directly.
 *
 * We extract both categories so the graph search can find:
 *  - bookable: true  → enable:true vacant gap (potentially re-bookable)
 *  - bookable: false → enable:false vacant interval (physically vacant, not guaranteed bookable)
 */

/**
 * @param {Array}  bdd        - raw bdd array from coachComposition API
 * @param {string} coachName  - coach name e.g. "A1"
 * @param {string} classCode  - class code e.g. "2A"
 * @param {Map}    stationMap - code → normalized station object
 * @param {Array}  schedule   - full normalized route schedule (needed for gap-fill)
 * @returns {Array} list of normalized vacant berth segment objects
 */
export function parseVacantSegments(bdd, coachName, classCode, stationMap, schedule = []) {
  if (!Array.isArray(bdd) || bdd.length === 0 || !stationMap) return [];

  // Build index → station-code map so we can fill gaps by route index
  const indexToStn = new Map();
  schedule.forEach(stn => indexToStn.set(stn.index, stn));

  const raw = [];

  for (const berth of bdd) {
    const berthNo   = Number(berth.berthNo || 0);
    const berthType = String(berth.berthCode || 'L').toUpperCase();
    const isEnabled = berth.enable !== false; // true unless explicitly false
    const bsd       = berth.bsd || [];

    if (isEnabled) {
      // ── ENABLED BERTHS ──────────────────────────────────────────────────
      // bsd shows only OCCUPIED portions.
      // We must compute vacant gaps = [berth.from → berth.to] MINUS occupied intervals.
      // BUT: if bsd has an explicit occupancy:false entry, trust it directly.

      const berthFromStn = stationMap.get(String(berth.from || '').toUpperCase());
      const berthToStn   = stationMap.get(String(berth.to || '').toUpperCase());
      if (!berthFromStn || !berthToStn || berthFromStn.index >= berthToStn.index) continue;

      const berthStart = berthFromStn.index;
      const berthEnd   = berthToStn.index;

      const occupiedRanges = [];
      let hasExplicitVacant = false;

      for (const entry of bsd) {
        const fStn = stationMap.get(String(entry.from || '').toUpperCase());
        const tStn = stationMap.get(String(entry.to   || '').toUpperCase());
        if (!fStn || !tStn || fStn.index >= tStn.index) continue;

        const isOcc = entry.occupancy === true || entry.occupancy === 'true';
        const isVac = entry.occupancy === false || entry.occupancy === 'false';

        if (isOcc) {
          occupiedRanges.push({ fromIdx: fStn.index, toIdx: tStn.index });
        } else if (isVac) {
          hasExplicitVacant = true;
          raw.push(makeSegment(coachName, berthNo, berthType, classCode, true,
            fStn, tStn));
        }
      }

      // Gap-fill: find intervals in [berthStart, berthEnd] not covered by any occupied range
      if (!hasExplicitVacant || occupiedRanges.length > 0) {
        const gaps = computeVacantGaps(berthStart, berthEnd, occupiedRanges, indexToStn, stationMap);
        gaps.forEach(([fStn, tStn]) => {
          raw.push(makeSegment(coachName, berthNo, berthType, classCode, true, fStn, tStn));
        });
      }

    } else {
      // ── DISABLED BERTHS (enable: false) ─────────────────────────────────
      // bsd lists ALL segments explicitly. Read occupancy: false directly.
      for (const entry of bsd) {
        const isVac = entry.occupancy === false || entry.occupancy === 'false';
        if (!isVac) continue;

        const fStn = stationMap.get(String(entry.from || '').toUpperCase());
        const tStn = stationMap.get(String(entry.to   || '').toUpperCase());
        if (!fStn || !tStn || fStn.index >= tStn.index) continue;

        raw.push(makeSegment(coachName, berthNo, berthType, classCode, false, fStn, tStn));
      }
    }
  }

  return mergeContiguousBerthSegments(raw);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function makeSegment(coach, berthNo, berthType, classCode, bookable, fStn, tStn) {
  return {
    classCode,
    coach,
    berthNo,
    berthType,
    bookable,          // true = potentially re-bookable; false = physically vacant only
    from:      fStn.code,
    to:        tStn.code,
    fromName:  fStn.name,
    toName:    tStn.name,
    fromIndex: fStn.index,
    toIndex:   tStn.index
  };
}

/**
 * Given a berth range [start → end] and a list of occupied sub-ranges,
 * returns the vacant gaps as [fromStn, toStn] pairs.
 */
function computeVacantGaps(start, end, occupiedRanges, indexToStn, stationMap) {
  if (occupiedRanges.length === 0) return []; // nothing occupied → no implicit gaps needed

  // Sort occupied ranges by start
  const sorted = [...occupiedRanges].sort((a, b) => a.fromIdx - b.fromIdx);

  const gaps = [];
  let cursor = start;

  for (const occ of sorted) {
    if (cursor < occ.fromIdx) {
      const fStn = indexToStn.get(cursor);
      const tStn = indexToStn.get(occ.fromIdx);
      if (fStn && tStn) gaps.push([fStn, tStn]);
    }
    cursor = Math.max(cursor, occ.toIdx);
  }

  // Gap after last occupied range
  if (cursor < end) {
    const fStn = indexToStn.get(cursor);
    const tStn = indexToStn.get(end);
    if (fStn && tStn) gaps.push([fStn, tStn]);
  }

  return gaps;
}

/**
 * Merge adjacent vacant segments for the same berth in the same coach.
 * e.g. (A→B) + (B→C) for same berth → (A→C)
 */
function mergeContiguousBerthSegments(segments) {
  if (segments.length === 0) return [];

  const groups = new Map();
  segments.forEach(seg => {
    const key = `${seg.coach}_${seg.berthNo}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(seg);
  });

  const merged = [];
  groups.forEach(group => {
    group.sort((a, b) => a.fromIndex - b.fromIndex);
    let current = null;
    for (const seg of group) {
      if (!current) {
        current = { ...seg };
      } else if (current.toIndex === seg.fromIndex) {
        current.toIndex = seg.toIndex;
        current.to      = seg.to;
        current.toName  = seg.toName;
      } else {
        merged.push(current);
        current = { ...seg };
      }
    }
    if (current) merged.push(current);
  });

  return merged;
}

/**
 * Build a cabin-keyed map from bdd for the berth-grid visualization.
 * Returns: { cabinNo → [{ berthNo, berthCode, bsd, enable, vacantForRange }] }
 */
export function buildCabinMap(bdd, boardingIdx, destinationIdx, stationMap) {
  const cabins = new Map();

  if (!Array.isArray(bdd)) return cabins;

  for (const berth of bdd) {
    const cabinKey = String(berth.cabinCoupeNameNo || '?');
    if (!cabins.has(cabinKey)) cabins.set(cabinKey, []);

    // Determine if this berth is vacant for ANY portion of the boarding→destination range
    let isVacantForJourney = false;
    const isEnabled = berth.enable !== false;
    const bsd = berth.bsd || [];

    if (isEnabled) {
      // Compute occupied ranges and find if there's a gap overlapping the journey
      const berthFromStn = stationMap.get(String(berth.from || '').toUpperCase());
      const berthToStn   = stationMap.get(String(berth.to   || '').toUpperCase());

      if (berthFromStn && berthToStn) {
        const bStart = berthFromStn.index;
        const bEnd   = berthToStn.index;

        const occupiedRanges = bsd
          .filter(e => e.occupancy === true || e.occupancy === 'true')
          .map(e => {
            const f = stationMap.get(String(e.from || '').toUpperCase());
            const t = stationMap.get(String(e.to   || '').toUpperCase());
            return f && t ? { from: f.index, to: t.index } : null;
          })
          .filter(Boolean);

        const explicitVacant = bsd.some(e => {
          if (e.occupancy !== false && e.occupancy !== 'false') return false;
          const f = stationMap.get(String(e.from || '').toUpperCase());
          const t = stationMap.get(String(e.to   || '').toUpperCase());
          if (!f || !t) return false;
          return f.index <= destinationIdx && t.index >= boardingIdx;
        });

        if (explicitVacant) {
          isVacantForJourney = true;
        } else {
          // Check gaps
          const sorted = [...occupiedRanges].sort((a, b) => a.from - b.from);
          let cursor = bStart;
          for (const occ of sorted) {
            if (cursor < occ.from) {
              // gap [cursor, occ.from] — check if it overlaps journey
              if (cursor <= destinationIdx && occ.from >= boardingIdx) {
                isVacantForJourney = true;
                break;
              }
            }
            cursor = Math.max(cursor, occ.to);
          }
          if (!isVacantForJourney && cursor < bEnd) {
            if (cursor <= destinationIdx && bEnd >= boardingIdx) {
              isVacantForJourney = true;
            }
          }
        }
      }
    } else {
      // enable: false — check explicit vacant bsd entries overlapping journey
      isVacantForJourney = bsd.some(e => {
        if (e.occupancy !== false && e.occupancy !== 'false') return false;
        const f = stationMap.get(String(e.from || '').toUpperCase());
        const t = stationMap.get(String(e.to   || '').toUpperCase());
        if (!f || !t) return false;
        return f.index <= destinationIdx && t.index >= boardingIdx;
      });
    }

    cabins.get(cabinKey).push({
      berthNo:   Number(berth.berthNo || 0),
      berthCode: String(berth.berthCode || 'L').toUpperCase(),
      enable:    isEnabled,
      bsd,
      isVacantForJourney
    });
  }

  return cabins;
}
