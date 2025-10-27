// src/index.tsx
import '@telegram-apps/telegram-ui/dist/styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { init } from '@/init.ts';
import { verifyInitData } from '@/lib/auth';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

/**
 * This function polls for window.Telegram.WebApp.initData.
 * This is the robust fix for the race condition.
 */
function waitForInitData(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      // Check if the data is available
      if (window.Telegram?.WebApp?.initData) {
        clearInterval(interval);
        resolve();
        return;
      }

      // Check for timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout: Waiting for window.Telegram.WebApp.initData failed."));
      }
    }, 50); // Poll every 50ms
  });
}

async function start() {
  try {
    // 1. Initialize the SDK
    await init({
      debug: false,
      eruda: false,
      mockForMacOS: !('Telegram' in window),
    });

    // 2. THE FIX: Wait for initData to be populated
    await waitForInitData(); 

    // 3. Now verify. initData is guaranteed to exist.
    await verifyInitData();

    console.log('Telegram user verified ✅');

    // 4. Now render the app
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
  } catch (e: any) {
    // If anything fails, render the real error message
    console.error('Init/verify failed', e);
    root.render(
      <div style={{ padding: '1em', color: 'red' }}>
        <h1>AIRE Boot Failure</h1>
        <pre>{e.toString()}</pre>
        <pre>{JSON.stringify(e)}</pre>
      </div>
    );
  }
}

start();