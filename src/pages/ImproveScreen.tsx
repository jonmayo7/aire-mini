// src/pages/ImproveScreen.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const RatingButtonGrid = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const numbers = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {numbers.map((number) => {
        const isSelected = value === number;
        return (
          <Button
            key={number}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="icon"
            className="w-12 h-12 text-base font-semibold"
            onClick={() => onChange(number)}
          >
            {number}
          </Button>
        );
      })}
    </div>
  );
};


export default function ImproveScreen() {
  const navigate = useNavigate();
  const { improve, setImprove, learn_rating, setLearnRating } = useAireStore();
  const { authenticatedFetch, hasSession } = useAuthenticatedFetch();
  const { isLoading: authLoading } = useAuth();

  const [previousCommitText, setPreviousCommitText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before making API call
    if (authLoading) {
      return;
    }

    // If no session, redirect to auth
    if (!hasSession) {
      navigate('/auth', { replace: true });
      return;
    }

    // Prevent infinite loops - only attempt once
    if (hasAttempted) {
      return;
    }

    const fetchPreviousCommit = async () => {
      setIsLoading(true);
      setError(null);
      setHasAttempted(true);
      
      try {
        const response = await authenticatedFetch('/api/cycles/lists', {
          method: 'GET',
        });

        if (!response.ok) {
          // Handle 401 Unauthorized - redirect to login
          if (response.status === 401) {
            navigate('/auth', { replace: true });
            return;
          }

          // Handle 404 - endpoint not found (deployment issue)
          if (response.status === 404) {
            const errorText = await response.text();
            console.error('API Endpoint Not Found:', response.status, errorText);
            setError('API endpoint not found. Please check Vercel deployment configuration.');
            setPreviousCommitText(null);
            setIsLoading(false);
            return;
          }

          const errorText = await response.text();
          console.error('API Error Response:', response.status, errorText);
          setError(`Failed to load previous commitment: ${response.status} ${response.statusText}`);
          // For first-time users, previous_commit will be null - this is expected
          setPreviousCommitText(null);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setPreviousCommitText(data.previous_commit || null); 
        setIsLoading(false);
      } catch (error: any) {
        console.error('Full fetch error:', error);
        // Handle "No active session" error gracefully
        if (error.message?.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        // Handle network errors (like ERR_INSUFFICIENT_RESOURCES)
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(error.message || 'Failed to load previous commitment');
        }
        // For first-time users, previous_commit will be null - this is expected
        setPreviousCommitText(null);
        setIsLoading(false);
      }
    };
    
    fetchPreviousCommit();
  }, [authenticatedFetch, hasSession, authLoading, navigate, hasAttempted]);

  // ... Conditional logic and component return (no change) ...
  // ... (pasting the rest of the file for completeness) ...

  const reflectQuestion = previousCommitText
    ? "What is the most powerful insight from executing this commitment?"
    : "What is the most valuable thing you learned yesterday?";

  const improvePlaceholder = previousCommitText
    ? "e.g., I was most effective when I..."
    : "e.g., Staying focused for 2 hours...";

  const handleNext = () => {
    navigate('/commit');
  };

  const handleRatingChange = (value: string) => {
    setLearnRating(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-destructive">{error}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => {
                setHasAttempted(false);
                setError(null);
                setIsLoading(true);
                // Trigger refetch by clearing hasAttempted
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }} variant="outline">
                Retry
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {previousCommitText && (
            <Card>
              <CardHeader>
                <CardTitle>Your Previous Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "{previousCommitText}"
                </p>
              </CardContent>
            </Card>
          )}

          {previousCommitText && (
            <Card>
              <CardHeader>
                <CardTitle>Part 1: Rate</CardTitle>
                <CardDescription>
                  On a scale of 1–10, how well did you execute your previous commitment?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RatingButtonGrid
                  value={learn_rating?.toString() ?? '5'} 
                  onChange={handleRatingChange}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{previousCommitText ? "Part 2: Reflect" : "Part 1: Reflect"}</CardTitle>
              <CardDescription>
                {reflectQuestion}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="improve-text">Your Reflection</Label>
                <Textarea
                  id="improve-text"
                  value={improve} 
                  onChange={(e) => setImprove(e.target.value)} 
                  placeholder={improvePlaceholder}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              Back
            </Button>
            <Button
              disabled={improve.trim().length === 0 || isLoading}
              onClick={handleNext}
              size="lg"
            >
              Next: Commit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}