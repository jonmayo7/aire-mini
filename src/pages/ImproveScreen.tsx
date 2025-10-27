import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
// Using the known-good components from v2.1.13
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function ImproveScreen() {
  const navigate = useNavigate();
  
  // Connect to the store
  const { improve, setImprove } = useAireStore();

  // Create local state for the text input
  const [localImprove, setLocalImprove] = useState(improve);

  const handleNext = () => {
    // 1. Save local state to global store
    setImprove(localImprove);
    // 2. Navigate to the next screen
    navigate('/commit');
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        header={<Headline weight="1">Step 3: IMPROVE</Headline>}
        footer="What is the one insight you can apply to improve execution next time?"
      >
        <Textarea
          value={localImprove}
          onChange={(e) => setLocalImprove(e.target.value)}
          placeholder="e.g., Block 90 mins for focus work..."
        />
      </Section>

      <Button
        size="l"
        disabled={localImprove.trim().length === 0}
        onClick={handleNext}
      >
        Next: Commit
      </Button>
    </div>
  );
}