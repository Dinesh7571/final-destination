import axiosClient from './axiosClient.js';
import { normalizeSchedule } from '../services/scheduleNormalizer.js';

/**
 * Fetch live train schedule directly from railchart.in or railberth.com
 */
export async function fetchTrainSchedule(trainNo) {
  const cleanTrainNo = String(trainNo).trim();
  const urls = [
    `https://railchart.in/api/schedule/${cleanTrainNo}`,
    `https://railberth.com/api/schedule/${cleanTrainNo}`
  ];

  for (const url of urls) {
    try {
      const response = await axiosClient.get(url);
      const data = response.data;
      let rawList = null;

      // railchart.in returns { stations: [...] }
      if (data && Array.isArray(data.stations) && data.stations.length > 0) {
        rawList = data.stations;
      } else if (data && Array.isArray(data.stationList) && data.stationList.length > 0) {
        // railberth.com returns { stationList: [...] }
        rawList = data.stationList;
      } else if (Array.isArray(data) && data.length > 0) {
        rawList = data;
      }

      if (rawList) {
        return normalizeSchedule(rawList);
      }
    } catch (err) {
      // Continue to next endpoint
    }
  }

  throw new Error(`Schedule could not be loaded for train ${cleanTrainNo}. Please verify the train number or try again.`);
}
