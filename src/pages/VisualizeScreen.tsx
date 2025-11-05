import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VisualizeScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cycleCount, setCycleCount] = useState<number | null>(null);
  const [isCheckingCycleCount, setIsCheckingCycleCount] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setIsSaving(true);
    const cycleData = { prime, learn_rating, improve, commit };

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
      setSaveError(error.message || 'An unknown error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>VISUALIZE</CardTitle>
          <CardDescription>
            Review your cycle. Saving will lock this data and start your next cycle.
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

      <div className="flex justify-center gap-2">
        <Button
          onClick={() => navigate(-1)}
          disabled={isSaving}
          variant="outline"
        >
          Back
        </Button>
        <Button
          disabled={isSaving}
          onClick={handleSubmit}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Forge Forward'}
        </Button>
      </div>
    </div>
  );
}