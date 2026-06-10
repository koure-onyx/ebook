'use client';

import { useCallback, useEffect, useState } from 'react';

export type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  board?: string;
  grade?: string;
  onboardingComplete?: boolean;
};

type UseUserResult = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useUser(initialUser: AuthUser | null = null): UseUserResult {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      setUser(data?.success && data.data?.user ? data.data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser === null) {
      refresh();
    }
  }, [initialUser, refresh]);

  return { user, loading, refresh };
}
