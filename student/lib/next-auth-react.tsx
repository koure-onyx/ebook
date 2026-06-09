'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMe, type User } from '@/lib/api/auth';

type SessionUser = User & {
  student_profile?: {
    xp?: number;
    onboarding_completed?: boolean;
  };
};

type Session = {
  user: SessionUser;
} | null;

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

type SessionContextValue = {
  data: Session;
  status: SessionStatus;
  update: () => Promise<Session>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

async function fetchSession(): Promise<Session> {
  const user = await getMe();
  return user ? { user: user as SessionUser } : null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');

      try {
        const session = await fetchSession();
        if (cancelled) return;
        setData(session);
        setStatus(session ? 'authenticated' : 'unauthenticated');
      } catch {
        if (cancelled) return;
        setData(null);
        setStatus('unauthenticated');
      }
    }

    load();

    const handleAuthChange = () => {
      void load();
    };

    window.addEventListener('studyvault-auth-changed', handleAuthChange);
    return () => {
      cancelled = true;
      window.removeEventListener('studyvault-auth-changed', handleAuthChange);
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      data,
      status,
      update: async () => {
        const session = await fetchSession().catch(() => null);
        setData(session);
        setStatus(session ? 'authenticated' : 'unauthenticated');
        return session;
      },
    }),
    [data, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    return {
      data: null,
      status: 'unauthenticated' as const,
      update: async () => null,
    };
  }

  return context;
}

export async function signIn(provider?: string, options?: { callbackUrl?: string }) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (provider === 'google') {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    window.location.href = `${apiBase}/auth/google`;
    return null;
  }

  if (options?.callbackUrl) {
    window.location.href = options.callbackUrl;
  }

  return null;
}

export async function signOut(options?: { callbackUrl?: string; redirect?: boolean }) {
  if (typeof window === 'undefined') {
    return null;
  }

  window.dispatchEvent(new Event('studyvault-auth-changed'));

  if (options?.redirect !== false) {
    window.location.href = options?.callbackUrl ?? '/';
  }

  return null;
}
