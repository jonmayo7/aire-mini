// src/components/Root.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/authContext';

// Import screens
import AuthScreen from '@/pages/AuthScreen';
import DashboardScreen from '@/pages/DashboardScreen';
import PrimeScreen from '@/pages/PrimeScreen';
import ImproveScreen from '@/pages/ImproveScreen';
import CommitScreen from '@/pages/CommitScreen';
import VisualizeScreen from '@/pages/VisualizeScreen';
import ImprovementLogScreen from '@/pages/ImprovementLogScreen';
import OnboardingScreen from '@/pages/OnboardingScreen';

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
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
      {/* Public route */}
      <Route path="/auth" element={<AuthScreen />} />
      
      {/* Protected routes - only accessible when authenticated */}
      {session ? (
        <>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/prime" element={<ProtectedRoute><PrimeScreen /></ProtectedRoute>} />
          <Route path="/improve" element={<ProtectedRoute><ImproveScreen /></ProtectedRoute>} />
          <Route path="/commit" element={<ProtectedRoute><CommitScreen /></ProtectedRoute>} />
          <Route path="/visualize" element={<ProtectedRoute><VisualizeScreen /></ProtectedRoute>} />
          <Route path="/improvements" element={<ProtectedRoute><ImprovementLogScreen /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingScreen /></ProtectedRoute>} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/prime" element={<Navigate to="/auth" replace />} />
          <Route path="/improve" element={<Navigate to="/auth" replace />} />
          <Route path="/commit" element={<Navigate to="/auth" replace />} />
          <Route path="/visualize" element={<Navigate to="/auth" replace />} />
          <Route path="/improvements" element={<Navigate to="/auth" replace />} />
          <Route path="/onboarding" element={<Navigate to="/auth" replace />} />
        </>
      )}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={session ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

export function Root() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}