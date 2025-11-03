import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // TODO: Implement Supabase JWT auth
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for list endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // TODO: Get user ID from Supabase JWT token
    const user_id = 'placeholder'; // Replace with actual user ID from JWT

    // Fetch data from Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .select('commit_text, created_at')
      .eq('user_id', user_id) // TODO: Replace tg_user_id column with user_id (from Supabase Auth)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase list error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // Handle "First Day" scenario
    if (!data || data.length === 0) {
      return res.status(200).json({ previous_commit: null });
    }

    // Success
    return res.status(200).json({ previous_commit: data[0].commit_text });

  } catch (error: any) {
    console.error('Overall /api/cycles/list error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};