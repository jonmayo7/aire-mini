import { AppRoot, Spinner } from '@telegram-apps/telegram-ui/'; // Import Spinner
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import useState and useEffect

// Import placeholder screens
import PrimeScreen from '@/pages/PrimeScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';

export function Root() {
  const webApp = window.Telegram.WebApp;
  const themeParams = webApp.themeParams;

  // --- NEW: Global Ready State ---
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    webApp.ready(); // Tell Telegram we are ready

    const checkInitData = (retries = 10) => {
      if (webApp.initData) {
        console.log('Root: initData is ready.');
        setIsReady(true); // Unlock the app
      } else if (retries > 0) {
        console.log(`Root: initData not found, retries left: ${retries}`);
        setTimeout(() => checkInitData(retries - 1), 200);
      } else {
        console.error('Root: Failed to get initData. App cannot load.');
        // You could show a permanent error here
      }
    };

    checkInitData();
  }, [webApp]);
  // --- END NEW ---

  // Guard clause: Don't render anything until theme and initData are ready
  if (!themeParams || !isReady) {
    // Show a full-page centered spinner
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="l" />
      </div>
    );
  }

  // Apply theme (this runs only after themeParams is ready)
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', themeParams.backgroundColor ?? '#ffffff');
    document.documentElement.style.colorScheme = themeParams.isDark ? 'dark' : 'light';
  }, [themeParams]);

  // Once ready, render the full app
  return (
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
  );
}