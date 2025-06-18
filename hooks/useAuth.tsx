import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { authAPI } from '../utils/api';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

interface AuthContextType {
  loggedInUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize role string from backend to UserRole enum
const normalizeUserRole = (role: string): UserRole => {
  switch (role.toUpperCase()) {
    case 'ADMIN': return UserRole.ADMIN;
    case 'SUPERVISOR': return UserRole.SUPERVISOR;
    case 'AGENT': return UserRole.AGENT;
    case 'MANAGEMENT': return UserRole.MANAGEMENT;
    default: return UserRole.PUBLIC;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token and get user profile
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const data = await authAPI.getProfile();
      if (data.success) {
        const user = data.data;
        user.role = normalizeUserRole(user.role);
        setLoggedInUser(user);
      } else {
        // Token invalid, remove it
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authAPI.login(username, password);

      if (data.success) {
        const { token, user } = data.data;
        user.role = normalizeUserRole(user.role);
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Set user
        setLoggedInUser(user);
        return user;
      } else {
        setError(data.message || 'Login failed');
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Network error. Please check your connection.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setLoggedInUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      loggedInUser, 
      login, 
      logout, 
      isLoading, 
      error, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
