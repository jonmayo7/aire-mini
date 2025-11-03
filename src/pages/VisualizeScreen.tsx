import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';

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
      // TODO: Implement Supabase JWT auth
      const response = await fetch('/api/cycles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cycle.');
      }

      alert('Your cycle data has been saved.');
      resetCycle();
      navigate('/prime');

    } catch (error: any) {
      console.error(error);
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