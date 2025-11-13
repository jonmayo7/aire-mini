import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prime, learn_rating, improve, commit, cycle_date } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    // Validate required fields
    if (!prime || !improve || !commit) {
      return res.status(400).json({ error: 'Missing required fields: prime, improve, and commit are required.' });
    }

    // Insert data into Supabase
    console.log('Attempting Supabase insert for user:', user_id);
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Prepare insert data with cycle_date if provided (user's local timezone), otherwise use database default
    const insertData: any = {
      user_id, // UUID from JWT token
      prime_text: prime,
      execution_score: learn_rating || null,
      improve_text: improve,
      commit_text: commit,
    };
    
    // Use provided cycle_date (user's local date) if available, otherwise database will use default
    if (cycle_date) {
      insertData.cycle_date = cycle_date;
    }
    
    const { data, error } = await supabase
      .from('cycles')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Database error',
        details: error.message,
        code: error.code
      });
    }

    // Increment cycles_completed counter for subscription tracking
    // First, check if subscription record exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          cycles_completed: (existingSubscription.cycles_completed || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);
    } else {
      // Create new subscription record with first cycle
      await supabase
        .from('subscriptions')
        .insert({
          user_id,
          status: 'trialing',
          cycles_completed: 1,
          trial_cycles_limit: 21,
        });
    }

    // Success
    console.log('Supabase insert successful:', data);
    return res.status(201).json({ success: true, data: data });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }

    console.error('Overall /api/cycles/create error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};