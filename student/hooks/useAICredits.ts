'use client';

import { useState, useEffect, useCallback } from 'react';

interface AICredits {
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
  isPremium: boolean;
}

export function useAICredits(userId: string) {
  const [credits, setCredits] = useState<AICredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!userId) return;

    try {
      // In a real implementation, this would fetch from /api/user/credits
      // For now, we'll simulate with local state
      // TODO: Implement /api/user/credits endpoint
      const mockCredits: AICredits = {
        used: 2, // Example: user has used 2 credits today
        limit: 5, // Free tier limit
        remaining: 3,
        resetAt: new Date(),
        isPremium: false,
      };

      setCredits(mockCredits);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI credits');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const refreshCredits = useCallback(() => {
    fetchCredits();
  }, [fetchCredits]);

  const consumeCredit = useCallback(() => {
    if (!credits) return;

    setCredits(prev => prev ? {
      ...prev,
      used: prev.used + 1,
      remaining: prev.remaining - 1,
    } : null);
  }, [credits]);

  return {
    credits,
    isLoading,
    error,
    refreshCredits,
    consumeCredit,
  };
}
