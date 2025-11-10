import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../../lib/api/verifyJWT';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for history endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    // Fetch all cycles from Supabase
    console.log('Fetching cycle history for user:', user_id);
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .select('id, cycle_date, execution_score, improve_text, created_at')
      .eq('user_id', user_id) // UUID from JWT token
      .order('created_at', { ascending: false }); // Most recent first

    if (error) {
      console.error('Supabase history error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // Handle "No cycles" scenario
    if (!data || data.length === 0) {
      return res.status(200).json({ cycles: [] });
    }

    // Success
    return res.status(200).json({ cycles: data });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/cycles/history error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

