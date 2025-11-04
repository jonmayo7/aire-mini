import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { useAuthenticatedFetch } from '@/lib/apiClient';

// Custom component to replace SimpleCell
function DataRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between items-center p-2 border-b border-gray-700">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-right">{value || '(Not set)'}</span>
    </div>
  );
}

export default function VisualizeScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const {
    prime,
    learn_rating,
    improve,
    commit,
    isSaving,
    setIsSaving,
    resetCycle,
  } = useAireStore();

  const handleSubmit = async () => {
    setIsSaving(true);
    const cycleData = { prime, learn_rating, improve, commit };

    try {
      const response = await authenticatedFetch('/api/cycles/create', {
        method: 'POST',
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cycle.');
      }

      alert('Your cycle data has been saved.');
      resetCycle();
      navigate('/');

    } catch (error: any) {
      console.error(error);
      // Handle "No active session" error
      if (error.message.includes('No active session')) {
        navigate('/auth', { replace: true });
        return;
      }
      alert(error.message || 'An unknown error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1>VISUALIZE</h1>
        <p>Review your cycle. Saving will lock this data and start your next cycle.</p>
        <DataRow label="Prime:" value={prime} />
        <DataRow label="Improve:" value={improve} />
        <DataRow label="Score:" value={learn_rating ? `${learn_rating}/10` : null} />
        <DataRow label="Commit:" value={commit} />
      </div>

      <div className="flex justify-center mt-2 gap-2">
        <button
          onClick={() => navigate(-1)}
          disabled={isSaving}
        >
          Back
        </button>
        <button
          disabled={isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? 'Saving...' : 'Forge Forward'}
        </button>
      </div>
    </div>
  );
}