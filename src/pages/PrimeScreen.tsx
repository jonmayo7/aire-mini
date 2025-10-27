import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button, Section, Textarea, Headline } from '@telegram-apps/telegram-ui'; // Changed imports

export default function PrimeScreen() {
  const navigate = useNavigate();
  
  // Connect to the store
  const { prime, setPrime } = useAireStore();

  // Create local state for the text input
  const [localPrime, setLocalPrime] = useState(prime);

  const handleNext = () => {
    setPrime(localPrime);
    navigate('/learn');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Use Section for a styled container */}
      <Section
        header={<Headline weight="1">Step 1: PRIME</Headline>}
        footer="What is your single most important objective to make today a success?"
      >
        <Textarea
          value={localPrime}
          onChange={(e) => setLocalPrime(e.target.value)}
          placeholder="e.g., Secure the new client contract"
        />
      </Section>

      <Button
        size="l"
        disabled={localPrime.trim().length === 0}
        onClick={handleNext}
      >
        Next: Learn
      </Button>
    </div>
  );
}