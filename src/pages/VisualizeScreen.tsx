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
  // Access the global object for utilities
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
          // THE FIX: Add the Authorization header
          'Authorization': `tma ${window.Telegram.WebApp.initData}`
        },
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cycle.');
      }

      // Use the global WebApp object for the alert
      // REMOVED 'pressedOk' parameter to fix TS errors
      webApp.showAlert('Your cycle data has been saved.', () => {
        // This callback runs after the user presses OK
        resetCycle();
        navigate('/prime');
      });

    } catch (error: any) {
      console.error(error);
      // Use the global object for the error alert
      // REMOVED 'pressedOk' parameter to fix TS errors
      webApp.showAlert(error.message || 'An unknown error occurred.', () => {
        setIsSaving(false); // Only unlock on error
      });
    }
    // Note: We don't set isSaving(false) on success, as the app navigates away
  };

  return (
    <div className="flex flex-col gap-4">
      <Section
        header={<Headline weight="1">Step 4: VISUALIZE</Headline>}
        footer="Review your cycle. Saving will lock this data and start your next cycle."
      >
        {/* Replace SimpleCell with our DataRow */}
        <DataRow label="Prime:" value={prime} />
        <DataRow label="Learn:" value={learn_rating ? `${learn_rating}/10` : null} />
        <DataRow label="Improve:" value={improve} />
        <DataRow label="Commit:" value={commit} />
      </Section>

      <Button
        size="l"
        loading={isSaving}
        disabled={isSaving}
        onClick={handleSubmit}
      >
        Save Cycle & Begin Anew
      </Button>
    </div>
  );
}