'use client';

import useSWR from 'swr';
import { getMe, User } from '@/lib/api/auth';

export function useUser() {
  const { data: user, error, isLoading, mutate } = useSWR<User | null, Error>(
    '/auth/me',
    () => getMe(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    user,
    isLoading,
    isError: !!error,
    mutate,
  };
}
