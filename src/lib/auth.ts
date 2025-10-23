// src/lib/auth.ts
export async function verifyInitData() {
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    if (!initData) throw new Error('No initData found in Telegram WebApp');
  
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Auth verify failed');
    return data as { ok: true; user: unknown };
  }
  