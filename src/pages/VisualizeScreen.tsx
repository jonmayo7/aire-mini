import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { useAuth } from '@/lib/authContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { queueRequest, getQueue } from '@/lib/offlineQueue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VisualizeScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { session } = useAuth();
  const isOnline = useOnlineStatus();
  const [cycleCount, setCycleCount] = useState<number | null>(null);
  const [isCheckingCycleCount, setIsCheckingCycleCount] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isQueued, setIsQueued] = useState(false);

  const {
    prime,
    learn_rating,
    improve,
    commit,
    isSaving,
    setIsSaving,
    resetCycle,
  } = useAireStore();

  // Check cycle count on mount to determine if this is first cycle
  useEffect(() => {
    const checkCycleCount = async () => {
      try {
        const response = await authenticatedFetch('/api/cycles/history', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setCycleCount(data.cycles?.length || 0);
        }
      } catch (err) {
        console.error('Error checking cycle count:', err);
        // Continue with assumption that preferences check will handle it
      } finally {
        setIsCheckingCycleCount(false);
      }
    };

    checkCycleCount();
  }, [authenticatedFetch]);

  // Check if there are queued saves
  useEffect(() => {
    const queue = getQueue();
    setIsQueued(queue.length > 0);
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    // Calculate user's local date in YYYY-MM-DD format
    const localDate = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
    const cycleData = { prime, learn_rating, improve, commit, cycle_date: localDate };

    // If offline, queue the request instead of attempting to save
    if (!isOnline) {
      console.log('[VisualizeScreen] Offline - queueing save request');
      try {
        // Get auth token from session
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        queueRequest('/api/cycles/create', 'POST', cycleData, headers);
        setIsQueued(true);
        setSaveMessage('Your DiRP cycle data is saved locally and will auto-update once back online. You are free to leave this page.');
        resetCycle();
        setIsSaving(false);
        
        // Navigate after brief delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      } catch (error) {
        console.error('[VisualizeScreen] Failed to queue request:', error);
        setSaveError('Failed to queue save. Your data is saved locally and will sync when back online.');
        setIsSaving(false);
        return;
      }
    }

    // Online - attempt to save immediately
    try {
      const response = await authenticatedFetch('/api/cycles/create', {
        method: 'POST',
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cycle.');
      }

      // After successful save, check if user has preferences set up
      // If this was their first cycle (cycleCount === 0), redirect to onboarding
      if (cycleCount === 0) {
        resetCycle();
        navigate('/onboarding', { replace: true });
        return;
      }

      // For subsequent cycles, check if preferences exist
      try {
        const prefResponse = await authenticatedFetch('/api/user/preferences', {
          method: 'GET',
        });

        if (prefResponse.ok) {
          const prefData = await prefResponse.json();
          // If no preferences, redirect to onboarding
          if (!prefData.preferences) {
            resetCycle();
            navigate('/onboarding', { replace: true });
            return;
          }
        }
      } catch (prefErr) {
        // If check fails, continue to dashboard
        console.error('Error checking preferences:', prefErr);
      }

      setSaveMessage('Your cycle data has been saved.');
      resetCycle();
      // Navigate after brief delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error: any) {
      console.error(error);
      // Handle "No active session" error
      if (error.message.includes('No active session')) {
        navigate('/auth', { replace: true });
        return;
      }
      
      // If network error and we're now offline, queue it
      if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
        console.log('[VisualizeScreen] Network error - queueing save request');
        try {
          const headers: Record<string, string> = {};
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
          queueRequest('/api/cycles/create', 'POST', cycleData, headers);
          setIsQueued(true);
          setSaveMessage('Your DiRP cycle data is saved locally and will auto-update once back online. You are free to leave this page.');
          resetCycle();
          setIsSaving(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        } catch (queueError) {
          console.error('[VisualizeScreen] Failed to queue request:', queueError);
        }
      }
      
      setSaveError(error.message || 'An unknown error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>VISUALIZE</CardTitle>
          <CardDescription>
            Review today's DiRP. Click Forge Forward to save this data and complete today's cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {saveMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">{saveMessage}</p>
            </div>
          )}
          {saveError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{saveError}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Prime</p>
              <p className="text-base">{prime || '(Not set)'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Improve</p>
              <p className="text-base">{improve || '(Not set)'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Score</p>
              <p className="text-base">{learn_rating ? `${learn_rating}/10` : '(Not set)'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Commit</p>
              <p className="text-base">{commit || '(Not set)'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-2">
        <Button
          onClick={() => navigate(-1)}
          disabled={isSaving}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          disabled={isSaving}
          onClick={handleSubmit}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isSaving ? 'Saving...' : 'Forge Forward'}
        </Button>
      </div>
    </div>
  );
}