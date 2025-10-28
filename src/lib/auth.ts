// src/lib/auth.ts

// --- FIX ---
// We now accept the initData string as an argument
// instead of reading from the global window object.
export async function verifyInitData(initData: string) {
  // --- END FIX ---
  
    if (!initData) {
      throw new Error('No initData provided. Cannot verify user.');
    }
  
    // Send to our secure Vercel endpoint
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the initData string we received as an argument
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