import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
// Note the trailing '/' in the import path
import { Button, Section, Headline, SegmentedControl } from '@telegram-apps/telegram-ui/';

// Define the options for the SegmentedControl
const ratingOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

export default function LearnScreen() {
  const navigate = useNavigate();
  
  // Connect to the store
  const { learn_rating, setLearnRating } = useAireStore();

  // We now use this state ONLY to set the *initial* value
  // and to hold the *final* value on submit.
  const [selectedRating, setSelectedRating] = useState(learn_rating?.toString() ?? '1');

  const handleNext = () => {
    // 1. Convert the final selected string back to a number
    setLearnRating(parseInt(selectedRating, 10));
    // 2. Navigate
    navigate('/improve');
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        header={<Headline weight="1">Step 2: LEARN</Headline>}
        footer="On a scale of 1-10, how well did you execute your Prime Objective?"
      >
        <SegmentedControl
          // Use 'defaultValue' instead of 'value'
          defaultValue={selectedRating}
          // Explicitly type 'value' as 'any'
          onChange={(value: any) => setSelectedRating(value as string)}
        >
          {ratingOptions.map(option => (
            <SegmentedControl.Item
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </Section>

      <Button
        size="l"
        onClick={handleNext}
      >
        Next: Improve
      </Button>
    </div>
  );
}