import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for webhook endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const user_id = session.metadata?.user_id;

        if (!user_id) {
          console.error('No user_id in checkout session metadata');
          return res.status(400).json({ error: 'Missing user_id in session metadata' });
        }

        // Get the subscription from the session
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;

          // Retrieve full subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer.id;

          // Update or create subscription record
          const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status === 'active' || subscription.status === 'trialing' ? subscription.status : 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          if (upsertError) {
            console.error('Error upserting subscription:', upsertError);
            return res.status(500).json({ error: 'Database error', details: upsertError.message });
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        // Find user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !existingSubscription) {
          console.error('Could not find subscription for customer:', customerId);
          break;
        }

        // Update subscription record
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            status: subscription.status === 'active' || subscription.status === 'trialing' ? subscription.status : subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', existingSubscription.user_id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return res.status(500).json({ error: 'Database error', details: updateError.message });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        // Find user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !existingSubscription) {
          console.error('Could not find subscription for customer:', customerId);
          break;
        }

        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', existingSubscription.user_id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return res.status(500).json({ error: 'Database error', details: updateError.message });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

