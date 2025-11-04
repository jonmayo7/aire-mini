import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Cycle {
  id: string;
  cycle_date: string;
  execution_score: number | null;
  improve_text: string | null;
  created_at: string;
}

export default function ImprovementLogScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Filter cycles that have improve_text
        const improvements = (data.cycles || []).filter(
          (cycle: Cycle) => cycle.improve_text && cycle.improve_text.trim().length > 0
        );
        setCycles(improvements);
      } catch (err: any) {
        console.error('Error fetching cycles:', err);
        if (err.message.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load improvements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycles();
  }, [authenticatedFetch, navigate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Improvement Log</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-center py-8">
              No improvements logged yet. Complete a cycle to see your progress.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Improvement Log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {cycles.map((cycle) => (
              <Card key={cycle.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {formatDate(cycle.created_at)}
                    </p>
                    {cycle.execution_score !== null && (
                      <p className="text-sm font-medium">
                        Score: {cycle.execution_score}/10
                      </p>
                    )}
                  </div>
                  <p className="text-base whitespace-pre-wrap">
                    {cycle.improve_text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

