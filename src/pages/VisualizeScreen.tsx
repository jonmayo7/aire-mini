import { useNavigate } from 'react-router-dom';
import { useAireStore } from '@/store/aireStore';
import { Button, Section, Headline } from '@telegram-apps/telegram-ui/';

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
  const webApp = window.Telegram.WebApp;

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
      const response = await fetch('/api/cycles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `tma ${window.Telegram.WebApp.initData}`
        },
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cycle.');
      }

      webApp.showAlert('Your cycle data has been saved.', () => {
        resetCycle();
        navigate('/prime');
      });

    } catch (error: any) {
      console.error(error);
      webApp.showAlert(error.message || 'An unknown error occurred.', () => {
        setIsSaving(false);
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        header={<Headline weight="1">VISUALIZE</Headline>}
        footer="Review your cycle. Saving will lock this data and start your next cycle."
      >
        <DataRow label="Prime:" value={prime} />
        <DataRow label="Improve:" value={improve} />
        <DataRow label="Score:" value={learn_rating ? `${learn_rating}/10` : null} />
        <DataRow label="Commit:" value={commit} />
      </Section>

      {/* --- FIX: ADDED BACK BUTTON --- */}
      <div className="flex justify-center mt-2 gap-2">
        <Button
          size="l"
          mode="outline"
          onClick={() => navigate(-1)} // Navigates to previous screen ('/commit')
          disabled={isSaving} // Disable if saving
        >
          Back
        </Button>
        <Button
          size="l"
          loading={isSaving}
          disabled={isSaving}
          onClick={handleSubmit}
        >
          Forge Forward
        </Button>
      </div>
      {/* --- END FIX --- */}
    </div>
  );
}