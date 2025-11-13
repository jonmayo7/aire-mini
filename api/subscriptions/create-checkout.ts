import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Only monthly subscription is supported
  const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    console.error('Missing STRIPE_MONTHLY_PRICE_ID environment variable');
    return res.status(500).json({ error: 'Server configuration error: Monthly Price ID not configured' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for create-checkout endpoint.');
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

    // Check if user already has active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingSubscription && existingSubscription.status === 'active' && !existingSubscription.cancel_at_period_end) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Get or create Stripe customer
    let customerId: string;
    
    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Get user email from Supabase auth
      const { data: userData, error: userError } = await (supabase.auth as any).admin.getUserById(user_id);
      
      if (userError || !userData?.user?.email) {
        console.error('Error fetching user email:', userError);
        return res.status(500).json({ error: 'Could not retrieve user information' });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          user_id: user_id,
        },
      });
      
      customerId = customer.id;

      // Update or create subscription record with customer ID
      if (existingSubscription) {
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user_id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id,
            stripe_customer_id: customerId,
            status: 'trialing',
            cycles_completed: 0,
            trial_cycles_limit: 14,
          });
      }
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.PWA_URL || 'https://aire-mini.vercel.app';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
      metadata: {
        user_id: user_id,
      },
    });

    return res.status(200).json({ checkoutUrl: session.url });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes('No Authorization') || 
        error.message?.includes('Invalid token') || 
        error.message?.includes('Token has expired') ||
        error.message?.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/subscriptions/create-checkout error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

