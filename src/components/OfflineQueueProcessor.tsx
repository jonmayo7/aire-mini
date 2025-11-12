import { useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { processQueue, getQueue } from '@/lib/offlineQueue';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { useAuth } from '@/lib/authContext';

/**
 * Component that processes queued requests when back online
 */
export function OfflineQueueProcessor() {
  const isOnline = useOnlineStatus();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { session } = useAuth();

  useEffect(() => {
    // Only process if online and user is authenticated
    if (!isOnline || !session?.access_token) {
      return;
    }

    const queue = getQueue();
    if (queue.length === 0) {
      return;
    }

    console.log('[OfflineQueueProcessor] Back online, processing queued requests');
    
    // Process queue with authenticated fetch
    processQueue(async (url: string, options: RequestInit) => {
      return authenticatedFetch(url, options);
    }).then((successCount) => {
      if (successCount > 0) {
        console.log(`[OfflineQueueProcessor] Successfully synced ${successCount} queued request(s)`);
        // Optionally show a toast notification here
      }
    }).catch((error) => {
      console.error('[OfflineQueueProcessor] Error processing queue:', error);
    });
  }, [isOnline, authenticatedFetch, session?.access_token]);

  return null; // This component doesn't render anything
}

