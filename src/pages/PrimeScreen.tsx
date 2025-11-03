import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';

export default function PrimeScreen() {
  const navigate = useNavigate();
  // --- FIX ---
  // Removed localPrime state
  // We bind directly to the global store
  const { prime, setPrime } = useAireStore();
  // --- END FIX ---

  const handleNext = () => {
    // setPrime is no longer needed here, it's already saved
    navigate('/improve');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1>PRIME</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
        What is one experience, gift, or opportunity you are grateful for right now, and why?
        </p>
        
        <textarea
          value={prime}
          onChange={(e) => setPrime(e.target.value)}
          placeholder="e.g., Grateful for my family..."
        />
      </div>

      <div className="flex justify-center mt-2">
        <button
          disabled={prime.trim().length === 0}
          onClick={handleNext}
        >
          Next: Improve
        </button>
      </div>
    </div>
  );
}