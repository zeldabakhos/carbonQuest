import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // TODO: Implement actual authentication with backend API
    // For now, we'll simulate a successful sign-in
    console.log('Signing in:', email);
    setIsSignedIn(true);
    return true;
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    // TODO: Implement actual registration with backend API
    // For now, we'll simulate a successful sign-up
    console.log('Signing up:', email);
    setIsSignedIn(true);
    return true;
  };

  const signOut = () => {
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signUp, signOut }}>
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
