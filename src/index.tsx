// src/index.tsx
import '@telegram-apps/telegram-ui/dist/styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import { verifyInitData } from '@/lib/auth';   // <-- added
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
// Initialize the Mini App environment
// We disable debug and mock modes in production (Vercel)
const isProduction = import.meta.env.PROD;

await init({
  debug: !isProduction && debug,
  eruda: !isProduction && debug && (platform === 'ios' || platform === 'android'),
  mockForMacOS: !isProduction && (platform === 'macos' || !('Telegram' in window)),
});

    // 🔐 Verify Telegram initData with our server before rendering
    await verifyInitData();
    console.log('Telegram user verified ✅');

    // Now render the app
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
  } catch (e) {
    console.error('Init/verify failed', e);
    root.render(<EnvUnsupported />);
  }
}

start();