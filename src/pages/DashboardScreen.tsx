import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { getQueue } from '@/lib/offlineQueue';
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
  const [hasQueuedSaves, setHasQueuedSaves] = useState(false);

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

  const handleViewProfile = () => {
    navigate('/profile');
  };

  // Transform cycles data for AscentGraph component
  // Pass full timestamps for micro-cycle visualization and consistency calculation
  const graphData = cycles
    .filter(cycle => cycle.execution_score !== null)
    .map(cycle => ({
      date: cycle.created_at,
      created_at: cycle.created_at, // Full timestamp for micro-cycles
      score: cycle.execution_score!,
      execution_score: cycle.execution_score,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      {hasQueuedSaves && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>DiRP cycle data saved locally.</strong> Will auto-update once back online. You are free to leave this page.
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your DiRP</CardTitle>
          <CardDescription>
            The Daily intentional Reflection Protocol (DiRP) is your engine to forge clarity, growth, and freedom.
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
          
          <Button onClick={handleViewProfile} variant="outline">
            Profile & Settings
          </Button>
          
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

