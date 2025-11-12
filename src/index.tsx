// src/index.tsx
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import './index.css';

// Register service worker for offline support (register immediately, don't wait for load)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('[Service Worker] Registered successfully:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('[Service Worker] Update found, new service worker installing...');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Service Worker] New service worker installed, reload to activate');
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error('[Service Worker] Registration failed:', error);
    });
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);