import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../lib/api';

interface AuthContextType {
  isSignedIn: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved user data on app start
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await authAPI.loadUserData();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authAPI.signIn(email, password);
      await authAPI.saveUserData(userData);
      setUser(userData);
      console.log('✅ Sign in successful:', userData.name);
      return true;
    } catch (error: any) {
      console.error('❌ Sign in error:', error.response?.data?.error || error.message);
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authAPI.signUp(name, email, password);
      await authAPI.saveUserData(userData);
      setUser(userData);
      console.log('✅ Sign up successful:', userData.name);
      return true;
    } catch (error: any) {
      console.error('❌ Sign up error:', error.response?.data?.error || error.message);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await authAPI.clearUserData();
      setUser(null);
      console.log('✅ Signed out');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
