// src/components/Root.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { ThemeProvider } from '@/lib/themeContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { OfflineQueueProcessor } from '@/components/OfflineQueueProcessor';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { PayGateModal } from '@/components/PayGateModal';

// Import screens
import AuthScreen from '@/pages/AuthScreen';
import DashboardScreen from '@/pages/DashboardScreen';
import PrimeScreen from '@/pages/PrimeScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';
import ImprovementLogScreen from '@/pages/ImprovementLogScreen';
import DiRPLogScreen from '@/pages/DiRPLogScreen';
import OnboardingScreen from '@/pages/OnboardingScreen';
import ProfileScreen from '@/pages/ProfileScreen';
import PrivacyPolicyScreen from '@/pages/PrivacyPolicyScreen';
import TermsOfServiceScreen from '@/pages/TermsOfServiceScreen';

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const { status, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const [showPayGate, setShowPayGate] = React.useState(false);

  // IMPORTANT: All hooks must be called before any conditional returns
  // Check if payment is required and set modal state
  const requiresPayment = status?.requiresPayment ?? false;
  
  React.useEffect(() => {
    setShowPayGate(requiresPayment);
  }, [requiresPayment]);

  // Now handle conditional returns
  if (isLoading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Show pay gate modal if payment is required
  // Only block if status exists AND requiresPayment is true
  // If status is null/undefined (error loading), allow access
  if (status && requiresPayment) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <PayGateModal
          isOpen={true}
          onClose={() => {
            // Don't allow closing - user must subscribe or go back
            window.history.back();
          }}
          cyclesCompleted={status.cyclesCompleted}
          cyclesRemaining={status.cyclesRemaining}
        />
      </div>
    );
  }

  return <>{children}</>;
}

// Main app routes component
function AppRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/privacy" element={<PrivacyPolicyScreen />} />
      <Route path="/terms" element={<TermsOfServiceScreen />} />
      
      {/* Protected routes - only accessible when authenticated */}
      {session ? (
        <>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/prime" element={<ProtectedRoute><PrimeScreen /></ProtectedRoute>} />
          <Route path="/improve" element={<ProtectedRoute><ImproveScreen /></ProtectedRoute>} />
          <Route path="/commit" element={<ProtectedRoute><CommitScreen /></ProtectedRoute>} />
          <Route path="/visualize" element={<ProtectedRoute><VisualizeScreen /></ProtectedRoute>} />
          <Route path="/dirp-log" element={<ProtectedRoute><DiRPLogScreen /></ProtectedRoute>} />
          <Route path="/improvements" element={<Navigate to="/dirp-log" replace />} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/prime" element={<Navigate to="/auth" replace />} />
          <Route path="/improve" element={<Navigate to="/auth" replace />} />
          <Route path="/commit" element={<Navigate to="/auth" replace />} />
          <Route path="/visualize" element={<Navigate to="/auth" replace />} />
          <Route path="/dirp-log" element={<Navigate to="/auth" replace />} />
          <Route path="/improvements" element={<Navigate to="/auth" replace />} />
          <Route path="/onboarding" element={<Navigate to="/auth" replace />} />
          <Route path="/profile" element={<Navigate to="/auth" replace />} />
        </>
      )}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={session ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

function RootContent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className="relative">
      <OfflineQueueProcessor />
      <OfflineBanner />
      <div className={isOnline ? '' : 'pt-20'}>
        <AppRoutes />
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <RootContent />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}