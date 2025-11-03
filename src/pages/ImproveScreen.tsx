// src/pages/ImproveScreen.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';

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

  const [previousCommitText, setPreviousCommitText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreviousCommit = async () => {
      setIsLoading(true);
      try {
        // TODO: Implement Supabase JWT auth
        const response = await fetch('/api/cycles/list', {
          method: 'GET',
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
  }, []);

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
      <h1>IMPROVE</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {previousCommitText && (
            <>
              <div>
                <h2>Your Previous Commitment</h2>
                <p className="italic text-gray-800 dark:text-gray-200">
                  "{previousCommitText}"
                </p>
              </div>
              <div>
                <h2>Part 1: Rate</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
                On a scale of 1–10, how well did you execute your previous commitment?
                </p>
                <RatingButtonGrid
                  value={learn_rating?.toString() ?? '5'} 
                  onChange={handleRatingChange}
                />
              </div>
            </>
          )}

          <div>
            <h2>{previousCommitText ? "Part 2: Reflect" : "Part 1: Reflect"}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
              {reflectQuestion}
            </p>
            <textarea
              value={improve} 
              onChange={(e) => setImprove(e.target.value)} 
              placeholder={improvePlaceholder}
            />
          </div>
        </>
      )}

      {/* --- Navigation --- */}
      <div className="flex justify-center mt-2 gap-2">
        <button onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          disabled={improve.trim().length === 0 || isLoading}
          onClick={handleNext}
        >
          Next: Commit
        </button>
      </div>
    </div>
  );
}