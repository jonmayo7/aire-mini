import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // TODO: Implement Supabase JWT auth
  const { prime, learn_rating, improve, commit } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // TODO: Get user ID from Supabase JWT token
    const user_id = 'placeholder'; // Replace with actual user ID from JWT

    // Insert data into Supabase
    console.log('Attempting Supabase insert...');
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .insert({
        user_id, // TODO: Replace tg_user_id column with user_id (from Supabase Auth)
        prime_text: prime,
        execution_score: learn_rating,
        improve_text: improve,
        commit_text: commit,
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Database error',
        details: error.message,
        code: error.code
      });
    }

    // Success
    console.log('Supabase insert successful:', data);
    return res.status(201).json({ success: true, data: data });

  } catch (error: any) {
    console.error('Overall /api/cycles/create error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};