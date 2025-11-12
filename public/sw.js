// Service Worker for AIRE PWA - Offline Support
const CACHE_NAME = 'aire-pwa-v2';
const RUNTIME_CACHE = 'aire-runtime-v2';

// Install event - cache index.html for offline fallback
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching index.html for offline fallback');
        // Only cache index.html as precache - everything else will be runtime cached
        return cache.addAll(['/index.html']).catch((err) => {
          console.warn('[Service Worker] Failed to precache index.html:', err);
        });
      })
      .then(() => {
        console.log('[Service Worker] Installation complete, skipping wait');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete, claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network First, Cache Fallback strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests (they need to go to network, no caching)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle favicon requests - return 204 (no content) if offline
  if (url.pathname === '/favicon.ico') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful favicon responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return 204 No Content for favicon when offline
          return new Response(null, { status: 204 });
        })
    );
    return;
  }

  // For navigation requests (page loads) - Network First, Cache Fallback
  // Hash routing means all routes serve index.html
  if (request.mode === 'navigate' || request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - try cache
          console.log('[Service Worker] Network failed for navigation, trying cache');
          return caches.match('/index.html').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, return a basic offline page
            return new Response(
              '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection and try again.</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' },
                status: 200
              }
            );
          });
        })
    );
    return;
  }

  // For all other requests (JS, CSS, images, fonts, etc.) - Network First, Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses (200-299)
        if (response.status >= 200 && response.status < 300) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn('[Service Worker] Failed to cache:', request.url, err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        console.log('[Service Worker] Network failed, trying cache for:', request.url);
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache and it's an image, return a placeholder
          if (request.destination === 'image') {
            return new Response('', { status: 204 });
          }
          // For other assets, return empty response
          return new Response('', { status: 503 });
        });
      })
  );
});
