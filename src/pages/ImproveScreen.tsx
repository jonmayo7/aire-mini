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

  useEffect(() => {
    const fetchPreviousCommit = async () => {
      console.log('Fetching previous commit...'); // DEBUG
      try {
        const response = await fetch('/api/cycles/list', {
          method: 'GET',
          headers: {
            'Authorization': `tma ${window.Telegram.WebApp.initData}`
          }
        });

        // --- DEBUGGING ---
        if (!response.ok) {
          const errorText = await response.text(); // Get raw error text
          console.error('API Error Response Text:', errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        // --- END DEBUGGING ---

        const data = await response.json();

        // --- DEBUGGING ---
        console.log('API Success Data:', data); 
        // --- END DEBUGGING ---
        
        setPreviousCommitText(data.previous_commit); 
      } catch (error) {
        // --- DEBUGGING ---
        console.error('Full fetch error:', error); // Log the full error object
        // --- END DEBUGGING ---
        setPreviousCommitText(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousCommit();
  }, []); 

  // This logic is already correct. It will use the "e.g." text once the fetch succeeds.
  const improvePlaceholder = previousCommitText
    ? "e.g., Block 90 mins for focus work..."
    : "What is the most valuable thing you learned yesterday?";

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
              placeholder={improvePlaceholder} // This will now use the correct text
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