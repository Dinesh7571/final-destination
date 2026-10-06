import { useState, useCallback } from 'react';
import { fetchTrainComposition, fetchCoachComposition } from '../api/charts';
import { createStationMap } from '../services/scheduleNormalizer';
import { parseVacantSegments } from '../services/vacancyParser';
import { findJourneysForPair } from '../services/journeyFinder';
import { findNearbyStationJourneys } from '../services/nearbyStationFinder';
import { rankAndFilterJourneys } from '../services/resultRanker';

export function useJourneySearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');
  const [searchStep, setSearchStep] = useState(0); // 0 to 5
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isCorsBlocked, setIsCorsBlocked] = useState(false);

  const executeSearch = useCallback(async ({
    trainNo,
    jDate,
    boardingCode,
    destinationCode,
    selectedClass,
    schedule
  }) => {
    if (!trainNo || !jDate || !boardingCode || !destinationCode || !schedule || schedule.length === 0) {
      setError('Please fill all required journey search fields.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);
    setIsCorsBlocked(false);

    try {
      const stationMap = createStationMap(schedule);
      const boardingStn = stationMap.get(boardingCode.toUpperCase());
      const destStn = stationMap.get(destinationCode.toUpperCase());

      if (!boardingStn || !destStn) {
        throw new Error('Selected stations are not present in this train schedule.');
      }

      if (boardingStn.index >= destStn.index) {
        throw new Error('Destination station must occur AFTER boarding station on the route.');
      }

      // Step 1: Chart fetch
      setSearchStep(1);
      setSearchProgress('Fetching prepared chart status...');
      
      const compRes = await fetchTrainComposition({
        trainNo,
        jDate,
        boardingStation: boardingCode
      });

      const allCoaches = compRes.data?.cdd || [];

      // Step 2: Select coaches to inspect based on selected class
      // NOTE: Do NOT discard coaches with vacantBerths === 0!
      // In IRCTC charts, cdd[].vacantBerths only indicates direct unbooked berths for the entire run.
      // But coachComposition reveals dozens of intermediate split vacancies (e.g. KNW->NDLS, MTJ->NDLS)
      // that passengers can use to complete their journey.
      setSearchStep(2);
      setSearchProgress('Selecting coaches for route vacancy analysis...');

      let classCoaches = allCoaches.filter(c => {
        if (!selectedClass || selectedClass === 'ALL') return true;
        return c.classCode === selectedClass;
      });

      // Prioritize coaches with direct vacancies first, but include all matching coaches
      classCoaches.sort((a, b) => (Number(b.vacantBerths || 0)) - (Number(a.vacantBerths || 0)));

      // Inspect ALL matching coaches!
      // In IRCTC, trainComposition only reports full-journey single-ticket vacancies.
      // But because passengers book sub-segments, intermediate portions are vacant in almost every coach!
      const coachesToInspect = classCoaches;

      // If no coaches exist for this class on this train, stop
      if (coachesToInspect.length === 0) {
        setResults({
          searchedTrainNo: trainNo,
          searchedDate: jDate,
          searchedClass: selectedClass,
          boardingStation: boardingStn,
          destinationStation: destStn,
          schedule,
          stationMap,
          allVacantSegments: [],
          options: [],
          totalCoachesInspected: 0,
          hasExactJourney: false,
          noVacancyInClass: true
        });
        return;
      }

      // Step 3: Fetch coach compositions for ALL coaches in safe concurrent batches
      setSearchStep(3);
      setSearchProgress(`Checking berth layouts across all ${coachesToInspect.length} coaches for portion vacancies...`);

      const remoteStn = compRes.data?.remote || compRes.data?.remoteStation || compRes.data?.chartRemote || boardingCode;
      const trainSourceStn = compRes.data?.from || compRes.data?.trainSourceStation || compRes.data?.stationFrom || schedule[0]?.stationCode || schedule[0]?.code || boardingCode;
      const trainStartDate = compRes.data?.trainStartDate || compRes.data?.jDate || jDate;

      const BATCH_SIZE = 6;
      const coachResults = [];

      for (let i = 0; i < coachesToInspect.length; i += BATCH_SIZE) {
        const batch = coachesToInspect.slice(i, i + BATCH_SIZE);
        const currentEnd = Math.min(i + BATCH_SIZE, coachesToInspect.length);
        setSearchProgress(`Checking berth layouts for coaches ${i + 1}–${currentEnd} of ${coachesToInspect.length}...`);

        const batchPromises = batch.map(coach =>
          fetchCoachComposition({
            trainNo,
            boardingStation: boardingCode,
            remoteStation: remoteStn,
            trainSourceStation: trainSourceStn,
            trainStartDate,
            jDate,
            coach: coach.coachName,
            cls: coach.classCode,
            schedule
          })
        );

        const batchRes = await Promise.allSettled(batchPromises);
        coachResults.push(...batchRes);
      }

      // Step 4: Parse vacant berth segments
      setSearchStep(4);
      setSearchProgress('Extracting vacant berth intervals across route...');

      let allVacantSegments = [];

      const coachBddMap = {}; // coach name → raw bdd array (for berth visualization)

      coachResults.forEach((res, index) => {
        if (res.status === 'fulfilled' && res.value?.data?.bdd) {
          const coachInfo = coachesToInspect[index];
          coachBddMap[coachInfo.coachName] = {
            bdd: res.value.data.bdd,
            classCode: coachInfo.classCode
          };
          // Pass schedule so the gap-fill algorithm can resolve station indexes → codes
          const segs = parseVacantSegments(
            res.value.data.bdd,
            coachInfo.coachName,
            coachInfo.classCode,
            stationMap,
            schedule          // ← new required arg for enable:true gap computation
          );
          allVacantSegments = allVacantSegments.concat(segs);
        }
      });

      // Step 5: Graph path search & ranking
      setSearchStep(5);
      setSearchProgress(`Finding best route combination to ${destStn.name}...`);

      const exactJourneys = findJourneysForPair(
        allVacantSegments,
        boardingStn.index,
        destStn.index,
        schedule
      );

      const nearbyJourneys = findNearbyStationJourneys({
        vacantSegments: allVacantSegments,
        reqBoardingIndex: boardingStn.index,
        reqDestinationIndex: destStn.index,
        schedule,
        hasExactOptions: exactJourneys.length > 0
      });

      const combinedAll = [...exactJourneys, ...nearbyJourneys];
      const rankedJourneys = rankAndFilterJourneys(combinedAll, boardingStn.index, destStn.index);

      setResults({
        searchedTrainNo: trainNo,
        searchedDate: jDate,
        searchedClass: selectedClass,
        boardingStation: boardingStn,
        destinationStation: destStn,
        schedule,
        stationMap,
        allVacantSegments,
        coachBddMap,         // raw bdd per coach → used for berth grid visualization
        options: rankedJourneys,
        totalCoachesInspected: coachesToInspect.length,
        hasExactJourney: exactJourneys.length > 0
      });

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred during search.');
    } finally {
      setIsSearching(false);
      setSearchProgress('');
      setSearchStep(0);
    }
  }, []);

  return {
    executeSearch,
    isSearching,
    searchProgress,
    searchStep,
    results,
    error,
    isCorsBlocked
  };
}
