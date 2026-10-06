import axios from 'axios';

const axiosClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is CORS / Network error
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      error.isCorsOrNetworkError = true;
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
