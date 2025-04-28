'use client';

import { logout as logoutAction } from '@/app/actions/session';
import { Session } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

// Session context type definition
interface SessionContextType {
  session: Session;
  updateSession: (updatedSession: Partial<Session>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

// Create context with null as default value
export const SessionContext = createContext<SessionContextType | null>(null);

/**
 * Hook to access session context
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

/**
 * Session provider component
 */
export function SessionProvider({
  children,
  session: initialSession,
}: {
  children: ReactNode;
  session: Session;
}) {
  const [session, setSession] = useState<Session>(initialSession);
  const router = useRouter();
  
  // Authentication status derived from session
  const isAuthenticated = !!session?.user;
  
  /**
   * Refreshes the session by fetching a new access token
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.refreshToken}`,
        },
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        setSession(prev => ({ 
          ...prev, 
          accessToken: sessionData.result.accessToken 
        }));
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, [session.refreshToken]);
  
  /**
   * Updates partial session data
   */
  const updateSession = useCallback((updatedSession: Partial<Session>) => {
    setSession(prevSession => ({
      ...prevSession,
      ...updatedSession,
    }));
  }, []);
  
  /**
   * Handles user logout
   */
  const logout = useCallback(async () => {
    await logoutAction();
    setSession({} as Session);
    router.push('/login');
  }, [router]);
  
  // Context value
  const contextValue = {
    session,
    updateSession,
    logout,
    isAuthenticated,
    refreshSession
  };
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}
