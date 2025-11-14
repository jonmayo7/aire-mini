import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ResonanceSuggestion {
  id: string;
  date: string;
  improve_text: string;
  execution_score: number | null;
  relevance_score: number;
}

export default function CommitScreen() {
  const navigate = useNavigate();
  const { commit, setCommit } = useAireStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [suggestions, setSuggestions] = useState<ResonanceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Debounce commit text for Resonance query
  const debouncedCommit = useDebounce(commit, 500);

  // Fetch Resonance suggestions when debounced commit text changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only query if commit text has meaningful content (at least 3 characters)
      if (!debouncedCommit || debouncedCommit.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await authenticatedFetch('/api/resonance/query', {
          method: 'POST',
          body: JSON.stringify({ commit_text: debouncedCommit }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/auth', { replace: true });
            return;
          }
          // Silently fail for other errors - don't block user experience
          console.error('Failed to fetch resonance suggestions');
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (err: any) {
        console.error('Error fetching resonance suggestions:', err);
        if (err.message.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        // Silently fail - don't block user experience
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedCommit, authenticatedFetch, navigate]);

  const handleNext = () => {
    navigate('/visualize');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>COMMIT</CardTitle>
          <CardDescription>
            What is the one action that if executed today, will guarantee clear progress and make today a success?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="commit-text">Your Commitment</Label>
            <Textarea
              id="commit-text"
              value={commit}
              onChange={(e) => setCommit(e.target.value)}
              placeholder="e.g., Finalize the Q4 report"
              className="min-h-[120px]"
            />
          </div>

          {/* Resonance Engine Suggestions */}
          {(debouncedCommit.trim().length >= 3 || suggestions.length > 0 || isLoadingSuggestions) && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-base">Related Past Improvements</CardTitle>
                <CardDescription>
                  Insights from your previous cycles that may help inform this commitment
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isLoadingSuggestions ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Finding relevant improvements...
                  </p>
                ) : suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No related improvements found. Keep typing to see suggestions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              {formatDate(suggestion.date)}
                            </p>
                            {suggestion.execution_score !== null && (
                              <p className="text-sm font-medium">
                                Score: {suggestion.execution_score}/10
                              </p>
                            )}
                          </div>
                          <p className="text-base whitespace-pre-wrap">
                            {suggestion.improve_text}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <Button
              disabled={commit.trim().length === 0}
              onClick={handleNext}
              size="lg"
              className="w-full"
            >
              Next: Visualize
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}