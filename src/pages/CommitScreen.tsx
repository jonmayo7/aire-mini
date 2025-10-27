import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function CommitScreen() {
  const navigate = useNavigate();
  
  // Connect to the store
  const { commit, setCommit } = useAireStore();

  // Create local state for the text input
  const [localCommit, setLocalCommit] = useState(commit);

  const handleNext = () => {
    // 1. Save local state to global store
    setCommit(localCommit);
    // 2. Navigate to the final screen
    navigate('/visualize');
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        header={<Headline weight="1">Step 4: COMMIT</Headline>}
        footer="What is your new Prime Objective for the next cycle?"
      >
        <Textarea
          value={localCommit}
          onChange={(e) => setLocalCommit(e.target.value)}
          placeholder="e.g., Re-engage the stalled prospect"
        />
      </Section>

      <Button
        size="l"
        disabled={localCommit.trim().length === 0}
        onClick={handleNext}
      >
        Next: Visualize
      </Button>
    </div>
  );
}