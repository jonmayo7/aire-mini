import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * Uses navigator.onLine and also checks network connectivity
 * @returns {boolean} true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Check both navigator.onLine and if we're in a browser environment
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online if navigator not available
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('[useOnlineStatus] Browser came online');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('[useOnlineStatus] Browser went offline');
      setIsOnline(false);
    };

    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also periodically check navigator.onLine in case events don't fire
    // (DevTools throttling might not trigger events)
    const checkOnlineStatus = () => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        console.log(`[useOnlineStatus] Status changed: ${isOnline} -> ${currentStatus}`);
        setIsOnline(currentStatus);
      }
    };

    // Check every 2 seconds (for DevTools throttling detection)
    const interval = setInterval(checkOnlineStatus, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return isOnline;
}

