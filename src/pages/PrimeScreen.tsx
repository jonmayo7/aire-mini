import { useState } from 'react'; // Kept for potential future local state
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function PrimeScreen() {
  const navigate = useNavigate();
  // --- FIX ---
  // Removed localPrime state
  // We bind directly to the global store
  const { prime, setPrime } = useAireStore();
  // --- END FIX ---

  const handleNext = () => {
    // setPrime is no longer needed here, it's already saved
    navigate('/improve');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Section
        header={<Headline weight="1">PRIME</Headline>}
      >
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
        What is one experience, gift, or opportunity you are grateful for right now, and why?
        </p>
        
        {/* --- FIX --- */}
        <Textarea
          value={prime} // Bind value to global state
          onChange={(e) => setPrime(e.target.value)} // setPrime on every keystroke
          placeholder="e.g., Grateful for my family..."
        />
        {/* --- END FIX --- */}
      </Section>

      <div className="flex justify-center mt-2">
        <Button
          size="l"
          // --- FIX ---
          // Disable button based on global state
          disabled={prime.trim().length === 0}
          // --- END FIX ---
          onClick={handleNext}
        >
          Next: Improve
        </Button>
      </div>
    </div>
  );
}