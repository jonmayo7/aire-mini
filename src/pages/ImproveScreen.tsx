import { useState } from 'react'; // Kept for potential future local state
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import {
  Button,
  Section,
  Headline,
  Textarea
} from '@telegram-apps/telegram-ui/';

// Custom Rating Component (No changes needed here)
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
              flex-shrink-0 font-semibold w-12 h-12 
              flex items-center justify-center
              transition-colors rounded-md
              ${isSelected ? 'selected-rating' : 'default-rating'}
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
  // --- FIX ---
  // Removed localImprove and selectedRating local state
  // Bind directly to the global store
  const {
    improve,
    setImprove,
    learn_rating,
    setLearnRating
  } = useAireStore();
  // --- END FIX ---
  
  const previousCommitText = undefined;
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..."
    : "What is the most valuable thing you learned yesterday?";

  const handleNext = () => {
    // Setters are no longer needed here
    navigate('/commit');
  };

  // --- FIX ---
  // This handler now updates the global store directly,
  // persisting the rating selection on every click.
  const handleRatingChange = (value: string) => {
    setLearnRating(parseInt(value, 10));
  };
  // --- END FIX ---

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">IMPROVE</Headline>

      {/* --- Part 1: Reflect Section --- */}
      <Section header="Part 1: Reflect">
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
        What is the single most powerful insight from yesterday that will make you more effective today?
        </p>
        
        {/* --- FIX --- */}
        <Textarea
          value={improve} // Bind value to global state
          onChange={(e) => setImprove(e.target.value)} // setImprove on every keystroke
          placeholder={improvePlaceholder}
        />
        {/* --- END FIX --- */}
      </Section>

      {/* --- Part 2: Rate Section --- */}
      <Section header="Part 2: Rate">
         <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
         On a scale of 1–10, how well did you execute yesterday's commitment?
         </p>
         
         {/* --- FIX --- */}
         <RatingButtonGrid
           value={learn_rating?.toString() ?? '5'} // Bind value to global state
           onChange={handleRatingChange} // Use new handler
         />
         {/* --- END FIX --- */}
      </Section>

      {/* --- Navigation --- */}
      <div className="flex justify-center mt-2 gap-2">
        <Button size="l" mode="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          size="l"
          // --- FIX ---
          // Disable button based on global state
          disabled={improve.trim().length === 0}
          // --- END FIX ---
          onClick={handleNext}
        >
          Next: Commit
        </Button>
      </div>
    </div>
  );
}