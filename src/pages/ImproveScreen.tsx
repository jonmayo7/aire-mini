// src/pages/ImproveScreen.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useInitData } from '@/hooks/useInitData'; // Import the hook
import {
  Button,
  Section,
  Headline,
  Textarea,
  Spinner,
} from '@telegram-apps/telegram-ui/';

// ... RatingButtonGrid component (no change) ...
// ... (omitted for brevity) ...
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


export default function ImproveScreen() {
  const navigate = useNavigate();
  const { improve, setImprove, learn_rating, setLearnRating } = useAireStore();
  const initData = useInitData(); // Get the "safe" initData from context

  const [previousCommitText, setPreviousCommitText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FIX: Simplified Fetch ---
  // This useEffect now runs with guaranteed, correct initData
  useEffect(() => {
    const fetchPreviousCommit = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cycles/list', {
          method: 'GET',
          // Use the initData from our hook
          headers: { 'Authorization': `tma ${initData}` }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Success Data:', data);
        setPreviousCommitText(data.previous_commit); 
      } catch (error) {
        console.error('Full fetch error:', error);
        setPreviousCommitText(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreviousCommit();
  }, [initData]); // Re-run if initData ever changed (it won't, but this is good practice)
  // --- END FIX ---

  // ... Conditional logic and component return (no change) ...
  // ... (pasting the rest of the file for completeness) ...

  const reflectQuestion = previousCommitText
    ? "What is the most powerful insight from executing this commitment?"
    : "What is the most valuable thing you learned yesterday?";

  const improvePlaceholder = previousCommitText
    ? "e.g., I was most effective when I..."
    : "e.g., Staying focused for 2 hours...";

  const handleNext = () => {
    navigate('/commit');
  };

  const handleRatingChange = (value: string) => {
    setLearnRating(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">IMPROVE</Headline>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="l" />
        </div>
      ) : (
        <>
          {previousCommitText && (
            <>
              <Section header="Your Previous Commitment">
                <p className="italic text-gray-800 dark:text-gray-200">
                  "{previousCommitText}"
                </p>
              </Section>
              <Section header="Part 1: Rate">
                <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
                On a scale of 1–10, how well did you execute your previous commitment?
                </p>
                <RatingButtonGrid
                  value={learn_rating?.toString() ?? '5'} 
                  onChange={handleRatingChange}
                />
              </Section>
            </>
          )}

          <Section header={previousCommitText ? "Part 2: Reflect" : "Part 1: Reflect"}>
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
              {reflectQuestion}
            </p>
            <Textarea
              value={improve} 
              onChange={(e) => setImprove(e.target.value)} 
              placeholder={improvePlaceholder}
            />
          </Section>
        </>
      )}

      {/* --- Navigation --- */}
      <div className="flex justify-center mt-2 gap-2">
        <Button size="l" mode="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          size="l"
          disabled={improve.trim().length === 0 || isLoading}
          onClick={handleNext}
        >
          Next: Commit
        </Button>
      </div>
    </div>
  );
}