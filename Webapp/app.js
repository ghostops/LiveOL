const API_BASE_URL = 'http://localhost:3036';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example GET request
const fetchData = async (endpoint, params) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    // Handle error appropriately
    console.error('API fetch error:', error);
    throw error;
  }
};

window.fetchData = fetchData;