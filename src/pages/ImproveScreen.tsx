import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import {
  Button,
  Section,
  Headline,
  SegmentedControl,
  Textarea
} from '@telegram-apps/telegram-ui/';

const ratingOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

export default function ImproveScreen() {
  const navigate = useNavigate();
  const {
    improve,
    setImprove,
    learn_rating, // Still using store's name
    setLearnRating // Still using store's setter name
  } = useAireStore();

  const [localImprove, setLocalImprove] = useState(improve);
  // Default to '5' if no rating exists yet
  const [selectedRating, setSelectedRating] = useState(learn_rating?.toString() ?? '5');

  // Placeholder for previous commit logic (add API call later)
  const previousCommitText = undefined;
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..."
    : "What is the most valuable thing you learned yesterday?";

  const handleNext = () => {
    setImprove(localImprove);
    // selectedRating is updated by handleRatingChange
    setLearnRating(parseInt(selectedRating, 10)); 
    navigate('/commit');
  };

  // Explicitly handle the change and update state
  const handleRatingChange = (value: any) => {
    setSelectedRating(value as string);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">Step 2: IMPROVE</Headline>

      {/* --- Part 1: Reflect Section --- */}
      <Section header="Part 1: Reflect">
        {previousCommitText && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-sm mb-1">Previous Commitment:</p>
            <p className="italic">{previousCommitText}</p>
          </div>
        )}
        {/* Moved question text ABOVE the input */}
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
          What is the one insight you can apply to improve execution next time?
        </p>
        <Textarea
          value={localImprove}
          onChange={(e) => setLocalImprove(e.target.value)}
          placeholder={improvePlaceholder}
        />
      </Section>

      {/* --- Part 2: Rate Section --- */}
      <Section header="Part 2: Rate">
         {/* Moved question text ABOVE the input */}
         <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
           On a scale of 1-10, how well did you execute your Prime Objective?
         </p>
        <div className="flex flex-wrap justify-center gap-1 w-full">
          <SegmentedControl
            // --- FIX ---
            // Reverted from 'value' to 'defaultValue' to resolve the error
            defaultValue={selectedRating}
            // This handler updates the 'selectedRating' state variable
            onChange={handleRatingChange}
            // --- END FIX ---
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
        </div>
      </Section>

      {/* --- Navigation --- */}
      <div className="flex justify-center mt-2 gap-2">
        <Button size="l" mode="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          size="l"
          disabled={localImprove.trim().length === 0}
          onClick={handleNext}
        >
          Next: Commit
        </Button>
      </div>
    </div>
  );
}