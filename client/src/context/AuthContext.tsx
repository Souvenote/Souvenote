'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import '@/lib/auth-config';
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthUser {
  userId: string;
  email: string;
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

      try {
        await fetchAuthSession();
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          email = attributes.email;
        }
      } catch {
        // Attributes may not be available yet for federated users
      }

      setUser({
        userId: cognitoUser.userId,
        email,
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
