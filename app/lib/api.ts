import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

// IMPORTANT: For physical devices, set your computer's local IP here
const PHYSICAL_DEVICE_IP = '172.20.10.2';

// Auto-detect the correct API URL based on platform
const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }

  // Development mode - choose URL based on platform
  if (Platform.OS === 'android') {
    // Android Emulator needs special IP to access host machine
    console.log('📱 Android detected - Using 10.0.2.2:3000');
    return 'http://10.0.2.2:3000';
  }

  // iOS (both simulator and physical device) - use local IP
  // localhost only works on simulator, local IP works for both
  console.log(`📱 iOS detected - Using ${PHYSICAL_DEVICE_IP}:3000`);
  return `http://${PHYSICAL_DEVICE_IP}:3000`;
};

const API_URL = getApiUrl();

console.log('🌐 API configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ API Request timeout - backend may not be running');
    } else if (error.message === 'Network Error') {
      console.error('❌ Network Error - Check if backend is running and API_URL is correct');
      console.error('   Current API_URL:', API_URL);
      if (Platform.OS === 'android') {
        console.error('   Android: Backend should be at http://10.0.2.2:3000');
      } else if (Platform.OS === 'ios') {
        console.error('   iOS: Backend should be at http://localhost:3000');
      }
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Authentication error - token may be invalid or expired');
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  scanCount?: number;
  points?: number;
  garden?: {
    plants: Array<{
      id: string;
      stage: number;
      growthPoints: number;
      plantedAt: string;
    }>;
    animals: string[];
    gardenLevel: number;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ScanData {
  barcode: string;
  name: string;
  brand?: string;
  co2e: number;
  carbonRating: string;
  source?: string;
}

export interface ScanHistory {
  _id: string;
  barcode: string;
  name: string;
  brand?: string;
  co2e: number;
  carbonRating: string;
  source?: string;
  createdAt: string;
}

export const authAPI = {
  async signUp(name: string, email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name,
      email,
      password,
    });

    console.log('📦 Full response:', JSON.stringify(response.data, null, 2));

    if (!response.data) {
      console.error('❌ No response.data');
      throw new Error('No response data from server');
    }

    if (!response.data.user) {
      console.error('❌ No response.data.user');
      throw new Error('No user data in response');
    }

    if (!response.data.user.id) {
      console.error('❌ No response.data.user.id');
      throw new Error('No user id in response');
    }

    // Save token
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);

    // Return user with id field
    return {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
    };
  },

  async signIn(email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signin', {
      email,
      password,
    });
    // Save token
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    // Return user with id field
    return {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
    };
  },

  async saveUserData(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  async loadUserData(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (userStr && token) {
      return JSON.parse(userStr);
    }
    return null;
  },

  async clearUserData(): Promise<void> {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
};

export const scanAPI = {
  async saveScan(userId: string, scanData: ScanData) {
    const response = await api.post('/scans', {
      userId,
      ...scanData,
    });
    return response.data;
  },

  async getUserScans(userId: string): Promise<ScanHistory[]> {
    const response = await api.get(`/scans/user/${userId}`);
    return response.data;
  },

  async getUserProfile(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export default api;
