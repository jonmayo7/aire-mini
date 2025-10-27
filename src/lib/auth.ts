// src/lib/auth.ts

export async function verifyInitData() {
  // Use the global object
  const initData = window.Telegram.WebApp.initData;

  if (!initData) {
    throw new Error('No initData found on window.Telegram.WebApp. Cannot verify user.');
  }

  // Send to our secure Vercel endpoint
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initData }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Verification failed: ${errorData.error || res.statusText}`);
  }

  const data = await res.json();

  if (!data.valid) {
    throw new Error('User data is not valid.');
  }

  // If valid, we're good to proceed
  return true;
}