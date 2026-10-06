import { useState, useEffect } from 'react';
import { fetchTrainList } from '../api/trains';
import { fetchTrainSchedule } from '../api/schedule';

export function useTrainSearch() {
  const [trains, setTrains] = useState([]);
  const [loadingTrains, setLoadingTrains] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState(null);
  
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  // Fetch train list on mount
  useEffect(() => {
    let isMounted = true;
    fetchTrainList().then(list => {
      if (isMounted) {
        setTrains(list);
        setLoadingTrains(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch schedule when a train is selected
  const handleSelectTrain = async (train) => {
    setSelectedTrain(train);
    if (!train || !train.trainNo) {
      setSchedule([]);
      return;
    }

    setLoadingSchedule(true);
    setScheduleError(null);

    try {
      const routeSchedule = await fetchTrainSchedule(train.trainNo);
      setSchedule(routeSchedule);
    } catch (err) {
      console.error('Error loading train schedule:', err);
      setScheduleError('Failed to load train schedule. Please try again.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  return {
    trains,
    loadingTrains,
    selectedTrain,
    setSelectedTrain: handleSelectTrain,
    schedule,
    loadingSchedule,
    scheduleError
  };
}
