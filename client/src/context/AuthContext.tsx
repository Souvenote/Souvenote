'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import '@/lib/auth-config';
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  imageCreditBalance?: number;
  songCreditBalance?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const cognitoUser = await getCurrentUser();
      let email = cognitoUser.signInDetails?.loginId ?? cognitoUser.username;
      let name = '';

      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          email = attributes.email;
        }
        if (attributes.name) {
          name = attributes.name;
        }

        // Fetch profile from backend to get credits
        if (token) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const profile = await response.json();
              setUser({
                userId: cognitoUser.userId,
                email,
                name: profile.name || name,
                imageCreditBalance: profile.imageCreditBalance,
                songCreditBalance: profile.songCreditBalance,
              });
              return;
            }
          } catch (fetchErr) {
            console.warn('Backend server unreachable. Using basic Cognito profile.');
          }
        }
      } catch (err) {
        console.error('Error fetching user attributes/session:', err);
      }

      setUser({
        userId: cognitoUser.userId,
        email,
        name,
        imageCreditBalance: 1, // Mock fallback
        songCreditBalance: 1,  // Mock fallback
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        refreshUser();
      }
      if (payload.event === 'signedOut') {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
