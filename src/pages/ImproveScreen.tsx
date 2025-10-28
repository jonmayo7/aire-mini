import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import {
  Button,
  Section,
  Headline,
  Textarea,
  Spinner,
} from '@telegram-apps/telegram-ui/';

// Custom Rating Component (No changes)
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
  const {
    improve,
    setImprove,
    learn_rating,
    setLearnRating
  } = useAireStore();
  
  const [previousCommitText, setPreviousCommitText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FIX: Wait for initData ---
  useEffect(() => {
    const webApp = window.Telegram.WebApp;

    const fetchPreviousCommit = async () => {
      console.log('Fetching previous commit...');
      setIsLoading(true);
      try {
        const response = await fetch('/api/cycles/list', {
          method: 'GET',
          headers: {
            // We are now sure webApp.initData is populated
            'Authorization': `tma ${webApp.initData}` 
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response Text:', errorText);
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

    // This function checks if initData is ready
    const checkInitData = () => {
      if (webApp.initData) {
        console.log('initData found. Fetching...');
        fetchPreviousCommit();
      } else {
        // If not ready, wait and check again
        console.log('initData not ready, polling...');
        setTimeout(checkInitData, 100);
      }
    };

    // Start the check
    checkInitData();

  }, []); // Empty array ensures this effect runs only once on mount
  // --- END FIX ---

  // --- FIX: Updated default placeholder text ---
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..." // If fetch succeeds
    : "e.g., Staying focused for 2 hours..."; // Default placeholder
  // --- END FIX ---

  const handleNext = () => {
    navigate('/commit');
  };

  const handleRatingChange = (value: string) => {
    setLearnRating(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">IMPROVE</Headline>

      {/* --- Part 1: Reflect Section --- */}
      <Section header="Part 1: Reflect">
        
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Spinner size="l" />
          </div>
        ) : (
          <>
            {previousCommitText && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-sm mb-1 text-gray-500 dark:text-gray-400">Your Previous Commitment:</p>
                <p className="italic">{previousCommitText}</p>
              </div>
            )}
            
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
            What is the single most powerful insight from yesterday that will make you more effective today?
            </p>
            <Textarea
              value={improve} 
              onChange={(e) => setImprove(e.target.value)} 
              placeholder={improvePlaceholder} // This now uses the new default
            />
          </>
        )}
      </Section>

      {/* --- Part 2: Rate Section --- */}
      <Section header="Part 2: Rate">
         <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
         On a scale of 1–10, how well did you honor and execute your yesterday's commitment?
         </p>
         <RatingButtonGrid
           value={learn_rating?.toString() ?? '5'} 
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
          disabled={improve.trim().length === 0 || isLoading}
          onClick={handleNext}
        >
          Next: Commit
        </Button>
      </div>
    </div>
  );
}