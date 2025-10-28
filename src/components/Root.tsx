// src/components/Root.tsx
import { AppRoot } from '@telegram-apps/telegram-ui/';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { InitDataProvider } from '@/hooks/useInitData'; // Import the provider

// Import placeholder screens
import PrimeScreen from '@/pages/PrimeScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';

// Accept initData as a prop
export function Root({ initData }: { initData: string }) {
  const webApp = window.Telegram.WebApp;
  const themeParams = webApp.themeParams;

  if (!themeParams) {
    return null;
  }

  // Apply theme
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', themeParams.backgroundColor ?? '#ffffff');
    document.documentElement.style.colorScheme = themeParams.isDark ? 'dark' : 'light';
  }, [themeParams]);

  return (
    // Wrap the entire app in the InitDataProvider
    <InitDataProvider initData={initData}>
      <AppRoot
        appearance={themeParams.isDark ? 'dark' : 'light'}
        platform={webApp.platform === 'ios' || webApp.platform === 'macos' ? 'ios' : 'base'}
      >
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/prime" replace />} />
            <Route path="/prime" element={<PrimeScreen />} />
            <Route path="/improve" element={<ImproveScreen />} />
            <Route path="/commit" element={<CommitScreen />} />
            <Route path="/visualize" element={<VisualizeScreen />} />
            <Route path="*" element={<Navigate to="/prime" replace />} />
          </Routes>
        </HashRouter>
      </AppRoot>
    </InitDataProvider>
  );
}