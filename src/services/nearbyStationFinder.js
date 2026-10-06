import { findJourneysForPair } from './journeyFinder';

/**
 * Nearby Station Finder Service
 * Searches for alternative journey combinations when exact origin-destination is unavailable.
 * Inspects:
 * - Up to 5 previous stations before boarding station
 * - Up to 5 next stations after destination station
 */

export function findNearbyStationJourneys({
  vacantSegments,
  reqBoardingIndex,
  reqDestinationIndex,
  schedule,
  hasExactOptions = false
}) {
  if (!Array.isArray(vacantSegments) || vacantSegments.length === 0 || !schedule) {
    return [];
  }

  const MAX_PREV_STATIONS = 5;
  const MAX_NEXT_STATIONS = 5;

  const earlierBoardingIndices = [];
  for (let i = 1; i <= MAX_PREV_STATIONS; i++) {
    const prevIdx = reqBoardingIndex - i;
    if (prevIdx >= 0 && schedule[prevIdx]?.boardingAllowed) {
      earlierBoardingIndices.push(prevIdx);
    }
  }

  const laterDestinationIndices = [];
  for (let j = 1; j <= MAX_NEXT_STATIONS; j++) {
    const nextIdx = reqDestinationIndex + j;
    if (nextIdx < schedule.length) {
      laterDestinationIndices.push(nextIdx);
    }
  }

  const alternativeOptions = [];

  // 1. Earlier Boarding -> Exact Destination
  earlierBoardingIndices.forEach(earlierIdx => {
    const paths = findJourneysForPair(vacantSegments, earlierIdx, reqDestinationIndex, schedule);
    paths.forEach(opt => {
      alternativeOptions.push({
        ...opt,
        id: `alt_board_${earlierIdx}_${reqDestinationIndex}_${opt.id}`,
        type: 'EARLIER_BOARDING',
        suggestedBoarding: schedule[earlierIdx],
        requestedBoarding: schedule[reqBoardingIndex],
        extraBoardingStops: reqBoardingIndex - earlierIdx,
        extraBoardingDistance: schedule[reqBoardingIndex].distance - schedule[earlierIdx].distance,
        label: `Board from ${schedule[earlierIdx].code} (${reqBoardingIndex - earlierIdx} stop${reqBoardingIndex - earlierIdx > 1 ? 's' : ''} earlier)`
      });
    });
  });

  // 2. Exact Boarding -> Later Destination
  laterDestinationIndices.forEach(laterIdx => {
    const paths = findJourneysForPair(vacantSegments, reqBoardingIndex, laterIdx, schedule);
    paths.forEach(opt => {
      alternativeOptions.push({
        ...opt,
        id: `alt_dest_${reqBoardingIndex}_${laterIdx}_${opt.id}`,
        type: 'LATER_DESTINATION',
        suggestedDestination: schedule[laterIdx],
        requestedDestination: schedule[reqDestinationIndex],
        extraDestinationStops: laterIdx - reqDestinationIndex,
        extraDestinationDistance: schedule[laterIdx].distance - schedule[reqDestinationIndex].distance,
        label: `Travel to ${schedule[laterIdx].code} (${laterIdx - reqDestinationIndex} stop${laterIdx - reqDestinationIndex > 1 ? 's' : ''} beyond destination)`
      });
    });
  });

  // 3. Combined: Earlier Boarding -> Later Destination
  earlierBoardingIndices.forEach(earlierIdx => {
    laterDestinationIndices.forEach(laterIdx => {
      const paths = findJourneysForPair(vacantSegments, earlierIdx, laterIdx, schedule);
      paths.forEach(opt => {
        alternativeOptions.push({
          ...opt,
          id: `alt_combined_${earlierIdx}_${laterIdx}_${opt.id}`,
          type: 'COMBINED_ALTERNATIVE',
          suggestedBoarding: schedule[earlierIdx],
          requestedBoarding: schedule[reqBoardingIndex],
          suggestedDestination: schedule[laterIdx],
          requestedDestination: schedule[reqDestinationIndex],
          extraBoardingStops: reqBoardingIndex - earlierIdx,
          extraBoardingDistance: schedule[reqBoardingIndex].distance - schedule[earlierIdx].distance,
          extraDestinationStops: laterIdx - reqDestinationIndex,
          extraDestinationDistance: schedule[laterIdx].distance - schedule[reqDestinationIndex].distance,
          label: `Board at ${schedule[earlierIdx].code} & travel to ${schedule[laterIdx].code}`
        });
      });
    });
  });

  return alternativeOptions;
}
