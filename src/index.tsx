import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function start() {
  let debug = true;
  let platform: 'android' | 'ios' | 'macos' | 'tdesktop' | 'web' | 'unrecognized' = 'macos';

  try {
    const lp = retrieveLaunchParams();
    debug = (lp.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;
    platform = lp.tgWebAppPlatform;
  } catch {
    // No Telegram context in plain browser. Proceed with safe defaults.
  }

  try {
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos' || !('Telegram' in window),
    });

    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
  } catch {
    root.render(<EnvUnsupported />);
  }
}

start();
