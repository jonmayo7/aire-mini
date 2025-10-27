import { AppRoot } from '@telegram-apps/telegram-ui';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Import placeholder screens
import PrimeScreen from '@/pages/PrimeScreen';
import LearnScreen from '@/pages/LearnScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';

// NOTE: We no longer import useWebApp, useInitData, useThemeParams, or LoadingScreen.
// The loading and initialization logic is handled in `index.tsx` *before* Root is rendered.

export function Root() {
  // Access the global object populated by init() in index.tsx
  // This is safe because index.tsx awaits init() before rendering <Root />
  const webApp = window.Telegram.WebApp;

  // Extract data directly from the global object
  const themeParams = webApp.themeParams;
  const platform = webApp.platform;

  // Apply theme
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', themeParams.backgroundColor ?? '#ffffff');
    document.documentElement.style.colorScheme = themeParams.isDark ? 'dark' : 'light';
  }, [themeParams]);

  return (
    <AppRoot
      appearance={themeParams.isDark ? 'dark' : 'light'}
      platform={platform === 'ios' || platform === 'macos' ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/prime" replace />} />

          {/* PLICV Steps */}
          <Route path="/prime" element={<PrimeScreen />} />
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/improve" element={<ImproveScreen />} />
          <Route path="/commit" element={<CommitScreen />} />
          <Route path="/visualize" element={<VisualizeScreen />} />

          {/* Fallback for any other route */}
          <Route path="*" element={<Navigate to="/prime" replace />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}