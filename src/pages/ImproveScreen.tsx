import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import {
  Button,
  Section,
  Headline,
  Textarea
} from '@telegram-apps/telegram-ui/';

// Custom Rating Component
const RatingButtonGrid = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const numbers = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {numbers.map((number) => {
        const isSelected = value === number;
        return (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`
              flex-shrink-0
              font-semibold
              rounded-lg
              w-12 h-12 
              flex items-center justify-center
              transition-colors
              ${isSelected
                // --- FIX ---
                // Reverted from CSS variable to the explicit hex code.
                // Tailwind can see and compile this class correctly.
                ? 'bg-[#004aad] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                // --- END FIX ---
              }
            `}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

// Main Screen Component
export default function ImproveScreen() {
  const navigate = useNavigate();
  const {
    improve,
    setImprove,
    learn_rating,
    setLearnRating
  } = useAireStore();

  const [localImprove, setLocalImprove] = useState(improve);
  const [selectedRating, setSelectedRating] = useState(learn_rating?.toString() ?? '5');
  
  const previousCommitText = undefined;
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..."
    : "What is the most valuable thing you learned yesterday?";

  const handleNext = () => {
    setImprove(localImprove);
    setLearnRating(parseInt(selectedRating, 10));
    navigate('/commit');
  };

  const handleRatingChange = (value: string) => {
    setSelectedRating(value);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">IMPROVE</Headline>

      {/* --- Part 1: Reflect Section --- */}
      <Section header="Part 1: Reflect">
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
         <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
           On a scale of 1-10, how well did you execute your Prime Objective?
         </p>
         <RatingButtonGrid
           value={selectedRating}
           onChange={handleRatingChange}
         />
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