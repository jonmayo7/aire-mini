import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for subscriptions status endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Query subscription for user
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      // If no subscription found, return 'none' status
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          status: 'none',
          cyclesCompleted: 0,
          cyclesRemaining: 14,
          requiresPayment: false,
        });
      }
      console.error('Supabase get subscription error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // Calculate cycles remaining
    const cyclesRemaining = Math.max(0, subscription.trial_cycles_limit - subscription.cycles_completed);
    
    // Determine if payment is required
    // Payment required if cycles_completed >= trial_cycles_limit AND status is not 'active'
    const requiresPayment = subscription.cycles_completed >= subscription.trial_cycles_limit && 
                           subscription.status !== 'active';

    return res.status(200).json({
      status: subscription.status || 'none',
      cyclesCompleted: subscription.cycles_completed || 0,
      cyclesRemaining,
      requiresPayment,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/subscriptions/status error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

