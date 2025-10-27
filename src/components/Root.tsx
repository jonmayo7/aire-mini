import { AppRoot } from '@telegram-apps/telegram-ui/';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Import placeholder screens
import PrimeScreen from '@/pages/PrimeScreen';
import LearnScreen from '@/pages/LearnScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';

export function Root() {
  // Access the global object populated by init() in index.tsx
  const webApp = window.Telegram.WebApp;
  const themeParams = webApp.themeParams;

  // This is the guard clause. If themeParams isn't ready,
  // render nothing (null) instead of crashing.
  if (!themeParams) {
    return null;
  }

  // Apply theme
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', themeParams.backgroundColor ?? '#ffffff');
    document.documentElement.style.colorScheme = themeParams.isDark ? 'dark' : 'light';
  }, [themeParams]);

  return (
    <AppRoot
      appearance={themeParams.isDark ? 'dark' : 'light'}
      platform={webApp.platform === 'ios' || webApp.platform === 'macos' ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/prime" replace />} />
          <Route path="/prime" element={<PrimeScreen />} />
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/improve" element={<ImproveScreen />} />
          <Route path="/commit" element={<CommitScreen />} />
          <Route path="/visualize" element={<VisualizeScreen />} />
          <Route path="*" element={<Navigate to="/prime" replace />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}