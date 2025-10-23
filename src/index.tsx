import '@telegram-apps/telegram-ui/dist/styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
const isDev = import.meta.env.DEV;

// Allowed platform values per TMA
type Platform = 'android' | 'ios' | 'macos' | 'tdesktop' | 'web' | 'unrecognized';

async function start() {
  let debug = true;
  let platform: Platform = 'web';

  try {
    const lp = retrieveLaunchParams();
    debug = (lp.tgWebAppStartParam || '').includes('debug') || isDev;

    // Cast and guard to satisfy TS in both browser + Telegram
    const p = (lp as any).tgWebAppPlatform as string | undefined;
    if (p && ['android', 'ios', 'macos', 'tdesktop', 'web', 'unrecognized'].includes(p)) {
      platform = p as Platform;
    }
  } catch {
    // No Telegram context; fall back to safe dev defaults
  }

  try {
    await init({
      debug,
      eruda: debug && (platform === 'ios' || platform === 'android'),
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
