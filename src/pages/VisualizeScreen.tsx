import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisualizeScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const {
    prime,
    learn_rating,
    improve,
    commit,
    isSaving,
    setIsSaving,
    resetCycle,
  } = useAireStore();

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

      alert('Your cycle data has been saved.');
      resetCycle();
      navigate('/');

    } catch (error: any) {
      console.error(error);
      // Handle "No active session" error
      if (error.message.includes('No active session')) {
        navigate('/auth', { replace: true });
        return;
      }
      alert(error.message || 'An unknown error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>VISUALIZE</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Review your cycle. Saving will lock this data and start your next cycle.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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