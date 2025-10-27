import { AppRoot } from '@telegram-apps/telegram-ui/';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Import placeholder screens
import PrimeScreen from '@/pages/PrimeScreen';
import LearnScreen from '@/pages/LearnScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';

export function Root() {
  const [webApp, setWebApp] = useState<any>(null);
  const [themeParams, setThemeParams] = useState<any>(null);
  const [platform, setPlatform] = useState<string>('base');

  useEffect(() => {
    // Wait for the window.Telegram.WebApp object to be populated
    const app = window.Telegram.WebApp;
    if (app) {
      app.ready(); // Inform Telegram UI is ready
      setWebApp(app);
      setThemeParams(app.themeParams);
      setPlatform(app.platform || 'base');
    }
  }, []);

  useEffect(() => {
    // Apply theme once themeParams is available
    if (themeParams) {
      document.documentElement.style.setProperty('background-color', themeParams.backgroundColor ?? '#ffffff');
      document.documentElement.style.colorScheme = themeParams.isDark ? 'dark' : 'light';
    }
  }, [themeParams]);

  // Render nothing until the webApp and themeParams are loaded
  if (!webApp || !themeParams) {
    return null; // This prevents the crash
  }

  return (
    <AppRoot
      appearance={themeParams.isDark ? 'dark' : 'light'}
      platform={platform === 'ios' || platform === 'macos' ? 'ios' : 'base'}
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