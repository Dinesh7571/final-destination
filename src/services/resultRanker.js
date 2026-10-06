/**
 * Result Ranker Service
 * Ranks generated journey options according to Indian Railways passenger priorities.
 */

export function rankAndFilterJourneys(allJourneys, reqBoardingIndex, reqDestinationIndex) {
  if (!Array.isArray(allJourneys) || allJourneys.length === 0) {
    return [];
  }

  // Calculate composite score for each option (lower score = better option)
  const scored = allJourneys.map(option => {
    let categoryScore = 0;

    switch (option.type) {
      case 'EXACT_DIRECT':
        categoryScore = 100;
        break;
      case 'EXACT_MULTI':
        if (option.berthChangesCount === 1) {
          categoryScore = 200;
        } else {
          categoryScore = 300 + option.berthChangesCount * 10;
        }
        break;
      case 'EARLIER_BOARDING':
        categoryScore = 400 + (option.extraBoardingStops || 1) * 20;
        break;
      case 'LATER_DESTINATION':
        categoryScore = 500 + (option.extraDestinationStops || 1) * 20;
        break;
      case 'COMBINED_ALTERNATIVE':
        categoryScore = 600 + ((option.extraBoardingStops || 1) + (option.extraDestinationStops || 1)) * 20;
        break;
      default:
        categoryScore = 700;
    }

    // Secondary penalty points
    let penalty = 0;

    // Penalty for berth changes
    penalty += (option.berthChangesCount || 0) * 15;

    // Check if segments switch coaches
    if (option.segments && option.segments.length > 1) {
      let coachSwitches = 0;
      let classSwitches = 0;

      for (let i = 0; i < option.segments.length - 1; i++) {
        if (option.segments[i].coach !== option.segments[i + 1].coach) {
          coachSwitches++;
        }
        if (option.segments[i].classCode !== option.segments[i + 1].classCode) {
          classSwitches++;
        }
      }

      penalty += coachSwitches * 10;
      penalty += classSwitches * 25;
    }

    // Penalty for extra distance
    const extraDist = (option.extraBoardingDistance || 0) + (option.extraDestinationDistance || 0);
    penalty += Math.floor(extraDist / 20);

    const totalScore = categoryScore + penalty;

    return {
      ...option,
      score: totalScore
    };
  });

  // Sort by composite score ascending
  scored.sort((a, b) => a.score - b.score);

  // Filter out duplicate or strictly inferior options to keep top 5 distinct options
  const distinctOptions = [];
  const seenSignatures = new Set();

  for (const opt of scored) {
    const sig = `${opt.type}_${opt.boardingIndex}_${opt.destinationIndex}_${opt.berthChangesCount}_${opt.segments.map(s => `${s.coach}-${s.berthNo}`).join(',')}`;
    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      distinctOptions.push(opt);
    }
    if (distinctOptions.length >= 5) break;
  }

  // Mark the #1 item as BEST OPTION
  if (distinctOptions.length > 0) {
    distinctOptions[0].isBestOption = true;
  }

  return distinctOptions;
}
