import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';

export default function CommitScreen() {
  const navigate = useNavigate();
  // --- FIX ---
  // Removed localCommit state
  // Bind directly to the global store
  const { commit, setCommit } = useAireStore();
  // --- END FIX ---

  const handleNext = () => {
    // setCommit is no longer needed here
    navigate('/visualize');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1>COMMIT</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">
        What is the one decisive action that, when you execute it today, will move you unmistakably forward?
        </p>
        
        <textarea
          value={commit}
          onChange={(e) => setCommit(e.target.value)}
          placeholder="e.g., Finalize the Q4 report"
        />
      </div>

      <div className="flex justify-center mt-2 gap-2">
         <button onClick={() => navigate(-1)}>
           Back
         </button>
        <button
          disabled={commit.trim().length === 0}
          onClick={handleNext}
        >
          Next: Visualize
        </button>
      </div>
    </div>
  );
}