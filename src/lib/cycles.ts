export async function createCycle(input: {
    prime?: string; learn?: string; executionScore?: number; improve?: string; commit?: string; cycleDate?: string;
  }) {
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    if (!initData) throw new Error('No initData');
    const res = await fetch('/api/cycles/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, ...input }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to create cycle');
    return data.cycle;
  }