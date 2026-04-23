import axios from 'axios';

// Set the base URL for all API calls
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response (${response.status}): ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend not running on http://localhost:5000');
      error.message = 'Cannot connect to backend. Make sure backend is running on http://localhost:5000';
    } else if (error.response) {
      console.error(`❌ API Error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
