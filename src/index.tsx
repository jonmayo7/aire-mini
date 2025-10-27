// src/index.tsx
import '@telegram-apps/telegram-ui/dist/styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { init } from '@/init.ts';
import { verifyInitData } from '@/lib/auth';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function start() {
  try {
    // 1. Initialize the SDK
    await init({
      debug: false,
      eruda: false,
      mockForMacOS: !('Telegram' in window),
    });

    // 2. THE TEST: Wait 1 second for the global object to populate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Now try to verify. initData should exist now.
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