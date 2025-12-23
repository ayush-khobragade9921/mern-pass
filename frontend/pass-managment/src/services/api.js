import axios from 'axios';

const API_BASE = 'https://visitor-backend-fxpw.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important: Send cookies with every request
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors that are NOT 401 on /users/me
    // (401 on /users/me is expected when not logged in)
    const isAuthCheck = error.config?.url?.includes('/users/me');
    const is401 = error.response?.status === 401;
    
    if (!isAuthCheck || !is401) {
      // Log other errors for debugging
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          message: error.response.data?.message || error.response.data?.error,
          url: error.config?.url
        });
      } else if (error.request) {
        console.error('Network Error:', error.message);
      } else {
        console.error('Error:', error.message);
      }
    }

    // Pass the error to the calling component
    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (endpoint, formData) => {
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Helper function for downloads
export const downloadFile = async (endpoint, filename) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;