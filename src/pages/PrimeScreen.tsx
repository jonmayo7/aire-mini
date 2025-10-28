import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
// Make sure imports are correct for your library version
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui/';

export default function PrimeScreen() {
  const navigate = useNavigate();
  const { prime, setPrime } = useAireStore();
  const [localPrime, setLocalPrime] = useState(prime);

  const handleNext = () => {
    setPrime(localPrime);
    navigate('/improve');
  };

  return (
    // Added padding
    <div className="flex flex-col gap-6 p-4">
      <Section
        header={<Headline weight="1">PRIME</Headline>}
        // REMOVED footer prop
      >
        {/* Moved question text ABOVE the input */}
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
          What is your single most important objective to make today a success?
        </p>
        <Textarea
          value={localPrime}
          onChange={(e) => setLocalPrime(e.target.value)}
          placeholder="e.g., Secure the new client contract"
        />
      </Section>

      {/* Centered button */}
      <div className="flex justify-center mt-2">
        <Button
          size="l"
          disabled={localPrime.trim().length === 0}
          onClick={handleNext}
        >
          Next: Improve
        </Button>
      </div>
    </div>
  );
}