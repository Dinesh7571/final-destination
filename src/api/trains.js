import axiosClient from './axiosClient.js';

/**
 * Fetch live train list directly from railchart.in (fallback to railberth.com)
 */
export async function fetchTrainList() {
  const urls = [
    'https://railchart.in/api/trains',
    'https://railberth.com/api/trainList'
  ];

  for (const url of urls) {
    try {
      const response = await axiosClient.get(url);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(item => ({
          trainNo: String(
            item.no               // railchart.in field
            || item.trainNumber   // railberth.com field
            || item.trainNo
            || item.number
            || item.train_number
            || ''
          ).trim(),
          trainName: (item.name || item.trainName || item.train_name || '').trim(),
          source: item.source || item.origin || item.from || item.sourceStation || '',
          destination: item.destination || item.to || item.destinationStation || ''
        })).filter(t => t.trainNo);
      }
    } catch (err) {
      // Try next endpoint
    }
  }

  return [];
}
