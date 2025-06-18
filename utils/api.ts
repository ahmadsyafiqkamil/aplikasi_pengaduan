// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// API helper function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getProfile: async () => {
    return apiCall('/auth/profile');
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

// Reports API functions
export const reportsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiCall(`/reports?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiCall(`/reports/${id}`);
  },

  getByTrackingId: async (trackingId: string) => {
    return apiCall(`/reports/tracking/${trackingId}`);
  },

  create: async (data: any) => {
    return apiCall('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: any) => {
    return apiCall(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string) => {
    return apiCall(`/reports/${id}`, {
      method: 'DELETE'
    });
  }
}; 