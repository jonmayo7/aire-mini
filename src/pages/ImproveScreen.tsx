import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
// Import all required components from both files
import {
  Button,
  Section,
  Headline,
  SegmentedControl,
  Textarea
} from '@telegram-apps/telegram-ui/';

// Define the options for the SegmentedControl (from original LearnScreen)
const ratingOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

// --- CHANGE ---
// The function name is changed to match the new file name.
export default function ImproveScreen() {
// --- END CHANGE ---

  const navigate = useNavigate();
  
  // Connect to the store for BOTH improve and learn_rating
  const { 
    improve, 
    setImprove, 
    learn_rating, 
    setLearnRating 
  } = useAireStore();

  // Local state for both inputs
  const [localImprove, setLocalImprove] = useState(improve);
  const [selectedRating, setSelectedRating] = useState(learn_rating?.toString() ?? '1');

  // --- New Logic for Previous Commit ---
  // TODO: Replace 'undefined' with an async fetch (e.g., in a useEffect) 
  const previousCommitText = undefined; // Example: "Run 3 miles at 7am"

  // Dynamic placeholder text as requested
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..."
    : "What is the most valuable thing you learned yesterday?";
  // --- End New Logic ---

  const handleNext = () => {
    // 1. Save BOTH local states to the global store
    setImprove(localImprove);
    setLearnRating(parseInt(selectedRating, 10));
    
    // 2. Navigate to the '/commit' screen (as per new flow)
    navigate('/commit');
  };

  return (
    // Added padding and increased gap for better layout
    <div className="flex flex-col gap-6 p-4">
      
      {/* --- CHANGE --- */}
      {/* This is Step 2 in the new flow, renamed to IMPROVE */}
      <Headline weight="1">Step 2: IMPROVE</Headline>
      {/* --- END CHANGE --- */}

      {/* --- Part 1: Reflect Section (from ImproveScreen.tsx) --- */}
      <Section
        // --- CHANGE ---
        header="Part 1: Reflect" // Renamed for clarity
        // --- END CHANGE ---
        footer="What is the one insight you can apply to improve execution next time?"
      >
        {/* Conditionally displays the previous commit when API is ready */}
        {previousCommitText && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-sm mb-1">Previous Commitment:</p>
            <p className="italic">{previousCommitText}</p>
          </div>
        )}

        <Textarea
          value={localImprove}
          onChange={(e) => setLocalImprove(e.target.value)}
          placeholder={improvePlaceholder}
        />
      </Section>

      {/* --- Part 2: Rate Section (from LearnScreen.tsx) --- */}
      <Section
        header="Part 2: Rate"
        footer="On a scale of 1-10, how well did you execute your Prime Objective?"
      >
        {/* Added wrapper for better layout on all screen sizes */}
        <div className="flex flex-wrap justify-center gap-1 w-full">
          <SegmentedControl
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
        </div>
      </Section>

      {/* --- Navigation --- */}
      <div className="flex justify-center mt-2 gap-2">
        <Button
          size="l"
          mode="outline" // Valid mode for a "Back" button
          onClick={() => navigate(-1)} // Navigates to previous screen ('/prime')
        >
          Back
        </Button>
        <Button
          size="l"
          // Validation logic from ImproveScreen
          disabled={localImprove.trim().length === 0} 
          onClick={handleNext}
        >
          Next: Commit
        </Button>
      </div>
    </div>
  );
}