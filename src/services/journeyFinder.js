/**
 * Journey Finder Algorithm
 * Treats train route as an ordered graph where stations are nodes
 * and vacant berth intervals are directed edges.
 * Uses BFS path-search algorithm to find direct & multi-segment berth combinations.
 */

/**
 * Main Journey Search function for a specific (boardingIndex, destinationIndex) pair
 * 
 * @param {Array} vacantSegments - List of normalized vacant berth segments
 * @param {number} boardingIndex - Route index of boarding station
 * @param {number} destinationIndex - Route index of destination station
 * @param {Array} schedule - Complete normalized train schedule array
 * @returns {Array} List of valid journey options
 */
export function findJourneysForPair(vacantSegments, boardingIndex, destinationIndex, schedule) {
  if (!Array.isArray(vacantSegments) || vacantSegments.length === 0 || boardingIndex >= destinationIndex) {
    return [];
  }

  const validOptions = [];

  // 1. Direct Single Berth Search
  const directSegments = vacantSegments.filter(
    seg => seg.fromIndex <= boardingIndex && seg.toIndex >= destinationIndex
  );

  directSegments.forEach(seg => {
    validOptions.push({
      id: `direct_${seg.coach}_${seg.berthNo}_${boardingIndex}_${destinationIndex}`,
      type: 'EXACT_DIRECT',
      isDirect: true,
      segmentsCount: 1,
      berthChangesCount: 0,
      boardingIndex,
      destinationIndex,
      boardingStation: schedule[boardingIndex],
      destinationStation: schedule[destinationIndex],
      segments: [
        {
          ...seg,
          travelFromIndex: boardingIndex,
          travelToIndex: destinationIndex,
          travelFromCode: schedule[boardingIndex].code,
          travelToCode: schedule[destinationIndex].code,
          travelFromName: schedule[boardingIndex].name,
          travelToName: schedule[destinationIndex].name,
          fromDeparture: schedule[boardingIndex].departure || schedule[boardingIndex].departureTime,
          fromArrival: schedule[boardingIndex].arrival || schedule[boardingIndex].arrivalTime,
          fromDay: schedule[boardingIndex].day || schedule[boardingIndex].dayCount || 1,
          toArrival: schedule[destinationIndex].arrival || schedule[destinationIndex].arrivalTime,
          toDeparture: schedule[destinationIndex].departure || schedule[destinationIndex].departureTime,
          toDay: schedule[destinationIndex].day || schedule[destinationIndex].dayCount || 1,
          distance: schedule[destinationIndex].distance - schedule[boardingIndex].distance
        }
      ]
    });
  });

  // 2. Multi-Segment Graph BFS Search (Berth changes)
  const multiSegmentPaths = findMultiSegmentPathsBFS(
    vacantSegments,
    boardingIndex,
    destinationIndex,
    schedule,
    5 // max 5 segments (4 berth changes)
  );

  multiSegmentPaths.forEach((path, idx) => {
    validOptions.push({
      id: `multi_${boardingIndex}_${destinationIndex}_${idx}`,
      type: 'EXACT_MULTI',
      isDirect: false,
      segmentsCount: path.length,
      berthChangesCount: path.length - 1,
      boardingIndex,
      destinationIndex,
      boardingStation: schedule[boardingIndex],
      destinationStation: schedule[destinationIndex],
      segments: path
    });
  });

  return validOptions;
}

/**
 * BFS Graph Path Search Algorithm
 * Finds paths of vacant segments covering from boardingIndex to destinationIndex
 */
function findMultiSegmentPathsBFS(vacantSegments, boardingIndex, destinationIndex, schedule, maxSegments = 5) {
  // Build adjacency list by fromIndex
  const adj = new Map();
  vacantSegments.forEach(seg => {
    if (!adj.has(seg.fromIndex)) {
      adj.set(seg.fromIndex, []);
    }
    adj.get(seg.fromIndex).push(seg);
  });

  // Also account for segments that started BEFORE boardingIndex but extend into boardingIndex
  const startingEdges = [];
  vacantSegments.forEach(seg => {
    if (seg.fromIndex <= boardingIndex && seg.toIndex > boardingIndex) {
      startingEdges.push({
        ...seg,
        effectiveFromIndex: boardingIndex
      });
    }
  });

  const completePaths = [];
  const queue = [];

  // Seed initial queue items
  startingEdges.forEach(edge => {
    // If edge already reaches or exceeds destinationIndex, it's a direct berth (handled separately)
    if (edge.toIndex < destinationIndex) {
      queue.push([edge]);
    }
  });

  const MAX_CANDIDATE_PATHS = 40;

  while (queue.length > 0 && completePaths.length < MAX_CANDIDATE_PATHS) {
    const path = queue.shift();
    if (path.length >= maxSegments) continue;

    const lastSeg = path[path.length - 1];
    const currentPos = lastSeg.toIndex;

    // Find next outgoing edges starting at currentPos
    const outgoing = adj.get(currentPos) || [];

    for (const nextEdge of outgoing) {
      // Avoid loops / redundant backwards edges
      if (path.some(p => p.coach === nextEdge.coach && p.berthNo === nextEdge.berthNo)) {
        // Same berth in same coach back-to-back: can merge
      }

      const newPath = [...path, nextEdge];

      if (nextEdge.toIndex >= destinationIndex) {
        // Reached destination! Trim last segment if it extends beyond destinationIndex
        const trimmedPath = trimPathToRange(newPath, boardingIndex, destinationIndex, schedule);
        if (isValidPath(trimmedPath)) {
          completePaths.push(trimmedPath);
        }
      } else {
        queue.push(newPath);
      }
    }
  }

  // Deduplicate paths with identical coaches & berths
  return deduplicatePaths(completePaths);
}

/**
 * Trims segment start/end to match exact travel range for clean rendering
 */
function trimPathToRange(path, boardingIndex, destinationIndex, schedule) {
  return path.map((seg, idx) => {
    const startIdx = idx === 0 ? Math.max(seg.fromIndex, boardingIndex) : seg.fromIndex;
    const endIdx = idx === path.length - 1 ? Math.min(seg.toIndex, destinationIndex) : seg.toIndex;

    const fromStn = schedule[startIdx] || { code: seg.from, name: seg.fromName, distance: 0 };
    const toStn = schedule[endIdx] || { code: seg.to, name: seg.toName, distance: 0 };

    return {
      ...seg,
      travelFromIndex: startIdx,
      travelToIndex: endIdx,
      travelFromCode: fromStn.code,
      travelToCode: toStn.code,
      travelFromName: fromStn.name,
      travelToName: toStn.name,
      fromDeparture: fromStn.departure || fromStn.departureTime,
      fromArrival: fromStn.arrival || fromStn.arrivalTime,
      fromDay: fromStn.day || fromStn.dayCount || 1,
      toArrival: toStn.arrival || toStn.arrivalTime,
      toDeparture: toStn.departure || toStn.departureTime,
      toDay: toStn.day || toStn.dayCount || 1,
      distance: (toStn.distance || 0) - (fromStn.distance || 0)
    };
  });
}

function isValidPath(path) {
  if (!path || path.length === 0) return false;
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i].travelToIndex !== path[i + 1].travelFromIndex) {
      return false; // gap in route
    }
  }
  return true;
}

function deduplicatePaths(paths) {
  const seen = new Set();
  const result = [];

  paths.forEach(p => {
    const signature = p.map(s => `${s.coach}-${s.berthNo}-${s.travelFromCode}-${s.travelToCode}`).join('|');
    if (!seen.has(signature)) {
      seen.add(signature);
      result.push(p);
    }
  });

  return result;
}
