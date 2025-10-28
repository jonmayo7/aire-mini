import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function CommitScreen() {
  const navigate = useNavigate();
  // --- FIX ---
  // Removed localCommit state
  // Bind directly to the global store
  const { commit, setCommit } = useAireStore();
  // --- END FIX ---

  const handleNext = () => {
    // setCommit is no longer needed here
    navigate('/visualize');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Section
        header={<Headline weight="1">COMMIT</Headline>}
      >
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
        What is the one decisive action that, when you execute it today, will move you unmistakably forward?
        </p>
        
        {/* --- FIX --- */}
        <Textarea
          value={commit} // Bind value to global state
          onChange={(e) => setCommit(e.target.value)} // setCommit on every keystroke
          placeholder="e.g., Finalize the Q4 report"
        />
        {/* --- END FIX --- */}
      </Section>

      <div className="flex justify-center mt-2 gap-2">
         <Button size="l" mode="outline" onClick={() => navigate(-1)}>
           Back
         </Button>
        <Button
          size="l"
          // --- FIX ---
          // Disable button based on global state
          disabled={commit.trim().length === 0}
          // --- END FIX ---
          onClick={handleNext}
        >
          Next: Visualize
        </Button>
      </div>
    </div>
  );
}