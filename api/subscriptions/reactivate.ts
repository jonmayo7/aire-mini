import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for reactivate endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY environment variable.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error || !subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (!subscription.stripe_subscription_id) {
      return res.status(400).json({ error: 'Subscription does not have a Stripe subscription ID' });
    }

    // Reactivate Stripe subscription (remove cancellation)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ error: 'Database error', details: updateError.message });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes('No Authorization') || 
        error.message?.includes('Invalid token') || 
        error.message?.includes('Token has expired') ||
        error.message?.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/subscriptions/reactivate error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

