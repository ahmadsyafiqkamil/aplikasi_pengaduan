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

  getUsers: async () => {
    return apiCall('/auth/users');
  },

  addUser: async (userData: any) => {
    return apiCall('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (userId: string, updates: any) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteUser: async (userId: string) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'DELETE'
    });
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

// Settings API functions
export const settingsAPI = {
  getSettings: async () => {
    const token = localStorage.getItem('token');
    return apiCall('/settings', {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  saveSetting: async (key: string, value: any, description?: string, category?: string) => {
    const token = localStorage.getItem('token');
    return apiCall('/settings', {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ key, value, description, category })
    });
  },

  getAppConfig: async () => {
    return apiCall('/settings/app-config');
  },

  updateAppConfig: async (configData: any) => {
    const token = localStorage.getItem('token');
    return apiCall('/settings/app-config', {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(configData)
    });
  }
}; 