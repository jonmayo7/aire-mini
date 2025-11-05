import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT';
import { findRelevantImprovements } from '../lib/resonance';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for resonance endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    // Validate request body
    const { commit_text } = req.body;
    if (!commit_text || typeof commit_text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid commit_text in request body' });
    }

    // Fetch all cycles with improve_text for this user
    console.log('Fetching improvements for resonance query, user:', user_id);
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .select('id, improve_text, execution_score, created_at')
      .eq('user_id', user_id)
      .not('improve_text', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase resonance query error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // Filter out cycles without improve_text
    const improvements = (data || [])
      .filter((cycle: any) => cycle.improve_text && cycle.improve_text.trim().length > 0)
      .map((cycle: any) => ({
        id: cycle.id,
        improve_text: cycle.improve_text,
        execution_score: cycle.execution_score,
        created_at: cycle.created_at,
      }));

    // Find relevant improvements using Resonance Engine
    const suggestions = findRelevantImprovements(improvements, commit_text, 3);

    // Success
    return res.status(200).json({ 
      suggestions: suggestions.map(s => ({
        id: s.id,
        date: s.created_at,
        improve_text: s.improve_text,
        execution_score: s.execution_score,
        relevance_score: Math.round(s.relevance_score * 10) / 10, // Round to 1 decimal
      }))
    });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/resonance/query error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

