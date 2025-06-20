// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiCall = async (method: string, path: string, body?: any, token?: string | null) => {
  const url = `${API_BASE_URL}${path}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    method: method.toUpperCase(),
    headers: headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Log the detailed error from the server
      console.error('API Error:', data);
      throw new Error(data.message || 'An unknown error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiCall('POST', '/auth/login', { username, password });
  },

  getProfile: async () => {
    return apiCall('GET', '/auth/profile');
  },

  getUsers: async () => {
    return apiCall('GET', '/auth/users');
  },

  addUser: async (userData: any) => {
    return apiCall('POST', '/auth/users', userData);
  },

  updateUser: async (userId: string, updates: any) => {
    return apiCall('PUT', `/auth/users/${userId}`, updates);
  },

  deleteUser: async (userId: string) => {
    return apiCall('DELETE', `/auth/users/${userId}`);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

// Reports API functions
export const reportsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiCall('GET', `/reports?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiCall('GET', `/reports/${id}`);
  },

  getByTrackingId: async (trackingId: string) => {
    return apiCall('GET', `/reports/tracking/${trackingId}`);
  },

  create: async (data: any) => {
    return apiCall('POST', '/reports', data);
  },

  update: async (id: string, data: any) => {
    return apiCall('PUT', `/reports/${id}`, data);
  },

  delete: async (id: string) => {
    return apiCall('DELETE', `/reports/${id}`);
  }
};

// Settings API functions
export const settingsAPI = {
  getSettings: async () => {
    return apiCall('GET', '/settings');
  },

  saveSetting: async (key: string, value: any, description?: string, category?: string) => {
    return apiCall('POST', '/settings', { key, value, description, category });
  },

  getAppConfig: async () => {
    return apiCall('GET', '/settings/app-config');
  },

  updateAppConfig: async (configData: any) => {
    return apiCall('PUT', '/settings/app-config', configData);
  }
}; 