// src/index.tsx
import '@telegram-apps/telegram-ui/dist/styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { verifyInitData } from '@/lib/auth';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

/**
 * This function polls for a condition to be true.
 * (This is your existing, correct function)
 */
function pollFor(
  condition: () => boolean,
  timeoutMessage: string,
  timeout = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
        return;
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(timeoutMessage));
      }
    }, 50); // Poll every 50ms
  });
}

async function start() {
  try {
    // 1. Wait for WebApp object
    await pollFor(
      () => !!window.Telegram?.WebApp,
      "Timeout: window.Telegram.WebApp object not found."
    );

    // 2. Signal ready
    window.Telegram.WebApp.ready();

    // 3. Wait for initData
    await pollFor(
      () => !!window.Telegram.WebApp.initData,
      "Timeout: window.Telegram.WebApp.initData not found."
    );

    // --- FIX: Capture initData ---
    const initData = window.Telegram.WebApp.initData;
    // --- END FIX ---

    // 5. Now verify.
    // --- FIX: Pass the captured initData as an argument ---
    await verifyInitData(initData);
    // --- END FIX ---

    console.log('Telegram user verified ✅');

    // 6. Now render the app, passing the captured initData
    root.render(
      <StrictMode>
        <Root initData={initData} />
      </StrictMode>,
    );
  } catch (e: any) {
    // ... error handling (no change) ...
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