import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CommitScreen() {
  const navigate = useNavigate();
  const { commit, setCommit } = useAireStore();

  const handleNext = () => {
    navigate('/visualize');
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>COMMIT</CardTitle>
          <CardDescription>
            What is the one decisive action that, when you execute it today, will move you unmistakably forward?
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
          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Back
            </Button>
            <Button
              disabled={commit.trim().length === 0}
              onClick={handleNext}
              size="lg"
            >
              Next: Visualize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}