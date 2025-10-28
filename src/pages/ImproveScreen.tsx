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

  // --- NEW: Robust initData Fetch ---
  useEffect(() => {
    const webApp = window.Telegram.WebApp;

    const fetchPreviousCommit = async (initData: string) => {
      console.log('Fetching previous commit with valid initData...');
      setIsLoading(true);
      try {
        const response = await fetch('/api/cycles/list', {
          method: 'GET',
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

    // This function polls for initData
    const getInitData = (retries = 10) => {
      if (webApp.initData) {
        console.log('initData found.');
        fetchPreviousCommit(webApp.initData);
      } else if (retries > 0) {
        console.log(`initData not ready, retries left: ${retries}`);
        setTimeout(() => getInitData(retries - 1), 200); // Wait 200ms
      } else {
        console.error('Failed to get initData after 10 retries.');
        setIsLoading(false); // Stop loading, show default state
        setPreviousCommitText(null);
      }
    };

    // Use Telegram.WebApp.ready() as the trigger
    webApp.ready();
    getInitData(); // Start polling for initData

  }, []); // Empty array ensures this effect runs only once on mount
  // --- END NEW ---

  // --- NEW: Placeholder based on your request ---
  const improvePlaceholder = "e.g., I was most effective when I...";

  const handleNext = () => {
    navigate('/commit');
  };

  const handleRatingChange = (value: string) => {
    setLearnRating(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Headline weight="1">IMPROVE</Headline>
      
      {/* Show spinner for the entire page while loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="l" />
        </div>
      ) : (
        <>
          {/* --- NEW: Context Section (Only shows if data exists) --- */}
          {previousCommitText && (
            <Section header="Your Previous Commitment">
              <p className="italic text-gray-800 dark:text-gray-200">
                "{previousCommitText}"
              </p>
            </Section>
          )}

          {/* --- NEW: Part 1: Rate (Moved up) --- */}
          <Section header="Part 1: Rate">
             <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
             On a scale of 1–10, how well did you execute your previous commitment?
             </p>
             <RatingButtonGrid
               value={learn_rating?.toString() ?? '5'} 
               onChange={handleRatingChange}
             />
          </Section>

          {/* --- NEW: Part 2: Reflect (Moved down) --- */}
          <Section header="Part 2: Reflect">
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
            What is the most powerful insight from executing this commitment?
            </p>
            <Textarea
              value={improve} 
              onChange={(e) => setImprove(e.target.value)} 
              placeholder={improvePlaceholder} // Use new placeholder
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