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
 * This is the robust fix for the race condition.
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

    // 2. Wait for the WebApp object to be created by init()
    await pollFor(
      () => !!window.Telegram?.WebApp,
      "Timeout: window.Telegram.WebApp object not found."
    );

    // 3. Signal to Telegram that the app is ready
    window.Telegram.WebApp.ready();

    // 4. Wait for the client to inject initData (which happens *after* .ready())
    await pollFor(
      () => !!window.Telegram.WebApp.initData,
      "Timeout: window.Telegram.WebApp.initData not found."
    );

    // 5. Now verify. initData is guaranteed to exist.
    await verifyInitData();

    console.log('Telegram user verified ✅');

    // 6. Now render the app
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