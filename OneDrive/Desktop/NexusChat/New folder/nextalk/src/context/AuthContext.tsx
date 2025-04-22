'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

type AuthContextType = {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string | null;
  sessionId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, userId, sessionId } = useClerkAuth();

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded, userId, sessionId }}>
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