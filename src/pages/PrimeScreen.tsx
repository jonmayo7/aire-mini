import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PrimeScreen() {
  const navigate = useNavigate();
  const { prime, setPrime } = useAireStore();

  const handleNext = () => {
    navigate('/improve');
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>PRIME</CardTitle>
          <CardDescription>
            What is one experience, gift, or opportunity you are grateful for right now, and why?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Exit Cycle
            </Button>
            <Button
              disabled={prime.trim().length === 0}
              onClick={handleNext}
              size="lg"
            >
              Next: Improve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}