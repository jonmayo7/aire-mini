// Use explicit 'node:' prefix for built-in modules
import { createHmac } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Auth validation function (re-used from verify)
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

// Function to parse user ID from initData
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

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get auth headers and body
  const { prime, learn_rating, improve, commit } = req.body;
  const authHeader = req.headers['authorization']; // 'tma <initData>'
  const botToken = process.env.BOT_TOKEN;

  // 2. Check env vars
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!botToken || !supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables.');
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
    const user_id = getUserId(initData);
    if (!user_id) {
      return res.status(400).json({ error: 'Bad Request: Could not parse user ID from initData.' });
    }

    // 5. Insert data into Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .insert({
        user_id,
        prime,
        learn_rating,
        improve,
        commit,
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // 6. Success
    return res.status(201).json({ success: true, data: data });

  } catch (error: any) {
    console.error('Create cycle error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};