import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { getQueue } from '@/lib/offlineQueue';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { PayGateModal } from '@/components/PayGateModal';
import AscentGraph from '@/components/AscentGraph';

interface Cycle {
  id: string;
  cycle_date: string;
  execution_score: number | null;
  improve_text: string | null;
  created_at: string;
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { status, refresh: refreshSubscription } = useSubscriptionStatus();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasQueuedSaves, setHasQueuedSaves] = useState(false);
  const [showPayGate, setShowPayGate] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const fetchCycles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch('/api/cycles/history', {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/auth', { replace: true });
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch cycles');
        }

        const data = await response.json();
        setCycles(data.cycles || []);
      } catch (err: any) {
        console.error('Error fetching cycles:', err);
        if (err.message.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load cycle data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycles();
  }, [authenticatedFetch, navigate]);

  // Check for queued saves
  useEffect(() => {
    const checkQueue = () => {
      const queue = getQueue();
      setHasQueuedSaves(queue.length > 0);
    };
    
    checkQueue();
    // Check periodically in case queue changes
    const interval = setInterval(checkQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle post-checkout success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');

    if (sessionId) {
      setCheckoutSuccess(true);
      // Clean up URL params immediately
      window.history.replaceState({}, '', window.location.pathname);
      
      // Poll for subscription status update (webhook may take a moment)
      // Try refreshing multiple times to ensure we get the updated status
      const refreshAttempts = [2000, 5000, 10000]; // 2s, 5s, 10s
      refreshAttempts.forEach((delay) => {
        setTimeout(() => {
          refreshSubscription();
        }, delay);
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setCheckoutSuccess(false), 5000);
    }

    if (canceled) {
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshSubscription]);

  const handleSubscribeClick = () => {
    setShowPayGate(true);
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleStartCycle = () => {
    navigate('/prime');
  };

  const handleViewDiRPLog = () => {
    navigate('/dirp-log');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  // Transform cycles data for AscentGraph component
  // Use cycle_date if available (user's local date), otherwise use created_at
  const graphData = cycles
    .filter(cycle => cycle.execution_score !== null)
    .map(cycle => ({
      date: cycle.cycle_date || cycle.created_at, // Prefer cycle_date (local date)
      created_at: cycle.created_at, // Full timestamp for micro-cycles
      score: cycle.execution_score!,
      execution_score: cycle.execution_score,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      {checkoutSuccess && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Subscription activated!</strong> Thank you for subscribing.
            </p>
          </CardContent>
        </Card>
      )}

      {hasQueuedSaves && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>DiRP cycle data saved locally.</strong> Will auto-update once back online. You are free to leave this page.
            </p>
          </CardContent>
        </Card>
      )}

      {status && status.cyclesCompleted >= 10 && status.status !== 'active' && status.requiresPayment && (
        <SubscriptionBanner
          cyclesCompleted={status.cyclesCompleted}
          cyclesRemaining={status.cyclesRemaining}
          onSubscribe={handleSubscribeClick}
        />
      )}
      
      <PayGateModal
        isOpen={showPayGate}
        onClose={() => setShowPayGate(false)}
        cyclesCompleted={status?.cyclesCompleted || 0}
        cyclesRemaining={status?.cyclesRemaining || 0}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your DiRP</CardTitle>
          <CardDescription>
            The Daily intentional Reflection Protocol (DiRP) is your engine to forge clarity, growth, and freedom.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AscentGraph data={graphData} />
          
          <Button onClick={handleStartCycle} size="lg" className="w-full sm:w-auto">
            Start Daily Cycle
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleViewDiRPLog} variant="outline" className="flex-1 sm:flex-none">
              DiRP Log
            </Button>
            
            <Button onClick={handleViewProfile} variant="outline" className="flex-1 sm:flex-none">
              Profile & Settings
            </Button>
          </div>
          
          <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

