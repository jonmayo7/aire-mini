import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PrimeScreen() {
  const navigate = useNavigate();
  const { prime, setPrime } = useAireStore();
  const { status } = useSubscriptionStatus();
  const [priorDayScore, setPriorDayScore] = useState<string>('');
  
  // Check if this is a first-time user (0 completed cycles)
  const isFirstTimeUser = status?.cyclesCompleted === 0;

  const handleNext = () => {
    navigate('/improve');
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>PRIME</CardTitle>
          <CardDescription>
            What is one experience, gift, or opportunity you are grateful for right now, and why?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* First-time user: Score prior day performance */}
          {isFirstTimeUser && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
              <Label htmlFor="prior-day-score" className="text-base font-semibold">
                Overall, on a scale from 1-10, how well did you show up with intention and maximize yesterday?
              </Label>
              <Input
                id="prior-day-score"
                type="number"
                min="1"
                max="10"
                value={priorDayScore}
                onChange={(e) => setPriorDayScore(e.target.value)}
                placeholder="Enter score (1-10)"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                This helps us understand your starting point. You won't see this question again after your first cycle.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="prime-text">Your Prime</Label>
            <Textarea
              id="prime-text"
              value={prime}
              onChange={(e) => setPrime(e.target.value)}
              placeholder="e.g., Grateful for my family..."
              className="min-h-[120px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Exit Cycle
            </Button>
            <Button
              disabled={prime.trim().length === 0}
              onClick={handleNext}
              size="lg"
              className="w-full sm:w-auto"
            >
              Next: Improve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}