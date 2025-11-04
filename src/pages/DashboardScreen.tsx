import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleStartCycle = () => {
    navigate('/prime');
  };

  const handleViewImprovements = () => {
    navigate('/improvements');
  };

  // Transform cycles data for AscentGraph component
  const graphData = cycles
    .filter(cycle => cycle.execution_score !== null)
    .map(cycle => ({
      date: cycle.created_at,
      score: cycle.execution_score!,
      execution_score: cycle.execution_score,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Daily AIRE</CardTitle>
          <CardDescription>
            Begin your daily cycle to build clarity, momentum, and agency.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AscentGraph data={graphData} />
          
          <Button onClick={handleStartCycle} size="lg">
            Start Daily Cycle
          </Button>
          
          <Button onClick={handleViewImprovements} variant="outline">
            View Improvement Log
          </Button>
          
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

