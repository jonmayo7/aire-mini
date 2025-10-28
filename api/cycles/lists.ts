import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Auth logic copied from create.ts ---
async function validate(initData: string, botToken: string): Promise<boolean> {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  urlParams.sort();
  let dataCheckString = '';
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);
  if (!hash) return false;
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return hmac === hash;
}

function getUserId(initData: string): string | null {
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id?.toString() || null;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse user ID from initData:', e);
    return null;
  }
}
// --- End auth logic ---


// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get auth headers and env vars
  const authHeader = req.headers['authorization']; // 'tma <initData>'
  const botToken = process.env.BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // 2. Check env vars
  if (!botToken || !supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for list endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // 3. Authenticate the request
  if (!authHeader || !authHeader.startsWith('tma ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth header.' });
  }
  const initData = authHeader.split(' ')[1];
  if (!initData) {
    return res.status(401).json({ error: 'Unauthorized: Missing initData.' });
  }

  try {
    const isValid = await validate(initData, botToken);
    if (!isValid) {
      return res.status(403).json({ error: 'Forbidden: Invalid initData HMAC.' });
    }

    // 4. Get User ID
    const tg_user_id = getUserId(initData);
    if (!tg_user_id) {
      return res.status(400).json({ error: 'Bad Request: Could not parse user ID.' });
    }

    // 5. Fetch data from Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .select('commit_text, created_at') // Matches 'commit_text' from create.ts
      .eq('tg_user_id', tg_user_id)
      .order('created_at', { ascending: false }) // Get the newest one first
      .limit(1); // We only need the single most recent commit

    if (error) {
      console.error('Supabase list error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // 6. Handle "First Day" scenario
    if (!data || data.length === 0) {
      return res.status(200).json({ previous_commit: null });
    }

    // 7. Success
    return res.status(200).json({ previous_commit: data[0].commit_text });

  } catch (error: any) {
    console.error('Overall /api/cycles/list error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};