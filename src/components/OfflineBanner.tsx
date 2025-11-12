import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Banner component that displays when the user is offline
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-black shadow-lg">
      <div className="p-3 text-center">
        <p className="font-semibold text-sm">You're offline</p>
        <p className="text-xs mt-1">Some features may be limited. Your data will sync when you're back online.</p>
      </div>
    </div>
  );
}

