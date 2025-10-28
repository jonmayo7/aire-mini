import { createHmac } from 'crypto';
// REMOVED: import { Buffer } from 'buffer'; // We deleted this import
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
      // Log the parsed user object for debugging
      console.log('Parsed user object:', user);
      return user.id?.toString() || null;
    }
    console.warn('User object not found in initData params');
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
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // 2. Log incoming data for debugging
  console.log('Received cycle data:', { prime, learn_rating, improve, commit });
  console.log('Received auth header:', authHeader ? authHeader.substring(0, 10) + '...' : 'None'); // Log prefix only

  // 3. Check env vars
  if (!botToken || !supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // 4. Authenticate the request
  if (!authHeader || !authHeader.startsWith('tma ')) {
    console.warn('Missing or invalid auth header.');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth header.' });
  }
  const initData = authHeader.split(' ')[1];
  if (!initData) {
    console.warn('Missing initData in auth header.');
    return res.status(401).json({ error: 'Unauthorized: Missing initData.' });
  }

  try {
    const isValid = await validate(initData, botToken);
    if (!isValid) {
      console.warn('Invalid initData HMAC.');
      return res.status(403).json({ error: 'Forbidden: Invalid initData HMAC.' });
    }
    console.log('HMAC validation successful.');

    // 5. Get User ID
    const tg_user_id = getUserId(initData); // Changed variable name to match DB
    console.log('Parsed tg_user_id:', tg_user_id); // Log the ID
    if (!tg_user_id) {
      console.error('Could not parse user ID from initData.');
      return res.status(400).json({ error: 'Bad Request: Could not parse user ID from initData.' });
    }

    // 6. Insert data into Supabase
    console.log('Attempting Supabase insert...');
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .insert({
        tg_user_id, // Ensure this matches the column name
        prime,
        learn_rating,
        improve,
        commit,
      })
      .select(); // Keep .select() to get the inserted row back

    // 7. THE CRITICAL LOGGING STEP: Check for Supabase-specific errors
    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2)); // Log the full error object
      return res.status(500).json({
        error: 'Database error',
        details: error.message, // Provide Supabase message
        code: error.code // Provide Supabase error code
      });
    }

    // 8. Success
    console.log('Supabase insert successful:', data);
    return res.status(201).json({ success: true, data: data });

  } catch (error: any) {
    console.error('Overall /api/cycles/create error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};