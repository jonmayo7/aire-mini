import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
// Make sure imports are correct for your library version
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function CommitScreen() {
  const navigate = useNavigate();
  const { commit, setCommit } = useAireStore();
  const [localCommit, setLocalCommit] = useState(commit);

  const handleNext = () => {
    setCommit(localCommit);
    navigate('/visualize'); // Navigate to Visualize screen
  };

  return (
    // Added padding
    <div className="flex flex-col gap-6 p-4">
      <Section
        // Removed 'Step Number' from header
        header={<Headline weight="1">COMMIT</Headline>}
        // REMOVED footer prop
      >
        {/* Moved question text ABOVE the input */}
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
           What is your new Prime Objective for the next cycle?
        </p>
        <Textarea
          value={localCommit}
          onChange={(e) => setLocalCommit(e.target.value)}
          placeholder="e.g., Finalize the Q4 report" // Example placeholder
        />
      </Section>

      {/* Centered buttons */}
      <div className="flex justify-center mt-2 gap-2">
         <Button size="l" mode="outline" onClick={() => navigate(-1)}>
           Back
         </Button>
        <Button
          size="l"
          disabled={localCommit.trim().length === 0}
          onClick={handleNext}
        >
          Next: Visualize
        </Button>
      </div>
    </div>
  );
}