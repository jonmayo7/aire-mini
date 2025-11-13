import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '@/lib/apiClient';

interface SubscriptionStatus {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'none';
  cyclesCompleted: number;
  cyclesRemaining: number;
  requiresPayment: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export function useSubscriptionStatus() {
  const { authenticatedFetch, hasSession } = useAuthenticatedFetch();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!hasSession) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/subscriptions/status', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscription status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      console.error('Error fetching subscription status:', err);
      setError(err.message || 'Failed to load subscription status');
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch, hasSession]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Refresh status after successful checkout (check URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && status && status.status !== 'active') {
      // Wait a moment for webhook to process, then refresh
      setTimeout(() => {
        fetchStatus();
        // Clean up URL params
        window.history.replaceState({}, '', window.location.pathname);
      }, 2000);
    }
  }, [status, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
  };
}

