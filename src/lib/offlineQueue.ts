/**
 * Offline Queue Manager
 * Queues API requests when offline and retries them when back online
 */

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: any;
  headers?: Record<string, string>;
  timestamp: number;
}

const QUEUE_KEY = 'aire-offline-queue';
const MAX_QUEUE_SIZE = 10; // Prevent queue from growing too large

/**
 * Add a request to the offline queue
 */
export function queueRequest(
  url: string,
  method: string,
  body: any,
  headers?: Record<string, string>
): void {
  try {
    const queue = getQueue();
    
    // Prevent queue from growing too large
    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('[OfflineQueue] Queue is full, removing oldest request');
      queue.shift();
    }
    
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      body,
      headers,
      timestamp: Date.now(),
    };
    
    queue.push(request);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[OfflineQueue] Queued request:', request.id, url);
  } catch (error) {
    console.error('[OfflineQueue] Failed to queue request:', error);
  }
}

/**
 * Get all queued requests
 */
export function getQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[OfflineQueue] Failed to get queue:', error);
    return [];
  }
}

/**
 * Remove a request from the queue
 */
export function removeQueuedRequest(id: string): void {
  try {
    const queue = getQueue();
    const filtered = queue.filter(req => req.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    console.log('[OfflineQueue] Removed queued request:', id);
  } catch (error) {
    console.error('[OfflineQueue] Failed to remove queued request:', error);
  }
}

/**
 * Clear all queued requests
 */
export function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
    console.log('[OfflineQueue] Cleared all queued requests');
  } catch (error) {
    console.error('[OfflineQueue] Failed to clear queue:', error);
  }
}

/**
 * Process queued requests (call when back online)
 */
export async function processQueue(
  fetchFn: (url: string, options: RequestInit) => Promise<Response>
): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) {
    return 0;
  }
  
  console.log(`[OfflineQueue] Processing ${queue.length} queued requests`);
  let successCount = 0;
  
  for (const request of queue) {
    try {
      const response = await fetchFn(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: JSON.stringify(request.body),
      });
      
      if (response.ok) {
        removeQueuedRequest(request.id);
        successCount++;
        console.log('[OfflineQueue] Successfully processed:', request.id);
      } else {
        // If request fails, keep it in queue for next retry
        console.warn('[OfflineQueue] Request failed, keeping in queue:', request.id, response.status);
      }
    } catch (error) {
      // If network error, keep in queue
      console.warn('[OfflineQueue] Request error, keeping in queue:', request.id, error);
    }
  }
  
  return successCount;
}

