-- ============================================
-- FIX SUBSCRIPTION STATUS TO ACTIVE
-- Run this in Supabase SQL Editor if subscription shows as 'trialing' after payment
-- Replace 'YOUR_USER_ID' with your actual user_id
-- ============================================

-- Update subscription status to 'active' if user has paid
-- Replace 'YOUR_USER_ID' with your actual user_id
UPDATE public.subscriptions 
SET status = 'active',
    updated_at = now()
WHERE user_id = '89892211-59d1-461d-81d9-0de4177f4504'
  AND stripe_subscription_id IS NOT NULL
  AND status = 'trialing';

-- Verify the update
SELECT user_id, status, stripe_subscription_id, cycles_completed, updated_at
FROM public.subscriptions
WHERE user_id = '89892211-59d1-461d-81d9-0de4177f4504';

