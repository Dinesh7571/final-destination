import axiosClient from './axiosClient.js';

/**
 * In-memory cache for current session searches to prevent duplicate requests
 */
const chartCache = new Map();

/**
 * Fetch Train Composition from IRCTC
 */
export async function fetchTrainComposition({ trainNo, jDate, boardingStation }) {
  const cacheKey = `composition_${trainNo}_${jDate}_${boardingStation}`;
  if (chartCache.has(cacheKey)) {
    return chartCache.get(cacheKey);
  }

  const payload = {
    trainNo: String(trainNo),
    jDate: String(jDate),
    boardingStation: String(boardingStation).toUpperCase()
  };

  const urls = [
    '/online-charts/api/trainComposition',
    'https://www.irctc.co.in/online-charts/api/trainComposition'
  ];

  for (const url of urls) {
    try {
      const response = await axiosClient.post(url, payload, {
        headers: {
          'Origin': 'https://railchart.in',
          'Referer': 'https://railchart.in/'
        }
      });
      if (response.data && response.data.cdd && response.data.cdd.length > 0) {
        const result = { data: response.data, isCorsBlocked: false };
        chartCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      // Continue to next URL
    }
  }

  throw new Error(`Chart not found or not yet prepared for train ${trainNo} on ${jDate} at ${boardingStation}.`);
}

/**
 * Fetch Coach Composition (Berth Details bdd[] and occupancy bsd[]) from IRCTC
 */
export async function fetchCoachComposition({
  trainNo,
  boardingStation,
  remoteStation,
  trainSourceStation,
  trainStartDate,
  jDate,
  coach,
  cls,
  schedule = []
}) {
  const cacheKey = `coach_${trainNo}_${boardingStation}_${coach}_${cls}_${jDate}`;
  if (chartCache.has(cacheKey)) {
    return chartCache.get(cacheKey);
  }

  const payload = {
    trainNo: String(trainNo),
    boardingStation: String(boardingStation).toUpperCase(),
    remoteStation: String(remoteStation || boardingStation).toUpperCase(),
    trainSourceStation: String(trainSourceStation || boardingStation).toUpperCase(),
    jDate: String(jDate),
    coach: String(coach).toUpperCase(),
    cls: String(cls).toUpperCase()
  };
  if (trainStartDate) {
    payload.trainStartDate = String(trainStartDate);
  }

  const urls = [
    '/online-charts/api/coachComposition',
    'https://www.irctc.co.in/online-charts/api/coachComposition'
  ];

  for (const url of urls) {
    try {
      const response = await axiosClient.post(url, payload, {
        headers: {
          'Origin': 'https://railchart.in',
          'Referer': 'https://railchart.in/'
        }
      });
      const respData = response.data;
      if (respData) {
        const berths = respData.bdd || respData.berthDetails;
        if (Array.isArray(berths) && berths.length > 0) {
          const normalized = {
            ...respData,
            bdd: berths
          };
          const result = { data: normalized, isCorsBlocked: false };
          chartCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (error) {
      // Continue
    }
  }

  // Return empty coach data if no berths found
  const emptyResult = { data: { bdd: [], coachName: coach }, isCorsBlocked: false };
  chartCache.set(cacheKey, emptyResult);
  return emptyResult;
}
