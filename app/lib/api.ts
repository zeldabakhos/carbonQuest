import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// IMPORTANT: Update this URL based on your setup:
// - For iOS Simulator: use 'http://localhost:3000'
// - For Android Emulator: use 'http://10.0.2.2:3000'
// - For physical device: use your computer's local IP (e.g., 'http://192.168.1.100:3000')
const API_URL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
}

export const authAPI = {
  async signUp(name: string, email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name,
      email,
      password,
    });
    return response.data;
  },

  async signIn(email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signin', {
      email,
      password,
    });
    return response.data;
  },

  async saveUserData(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  async loadUserData(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  async clearUserData(): Promise<void> {
    await AsyncStorage.removeItem('user');
  },
};

export default api;
