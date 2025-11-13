-- ============================================
-- FIX SUBSCRIPTION STATUS TO ACTIVE
-- Run this in Supabase SQL Editor if subscription shows as 'trialing' after payment
-- Replace 'YOUR_USER_ID' with your actual user_id
-- ============================================

-- Update subscription status to 'active' if user has paid
UPDATE public.subscriptions 
SET status = 'active',
    updated_at = now()
WHERE user_id = 'ea9c2fc8-e2c3-454e-a870-f7913e437500'
  AND stripe_subscription_id IS NOT NULL
  AND status = 'trialing';

-- Verify the update
SELECT user_id, status, stripe_subscription_id, cycles_completed, updated_at
FROM public.subscriptions
WHERE user_id = 'ea9c2fc8-e2c3-454e-a870-f7913e437500';

