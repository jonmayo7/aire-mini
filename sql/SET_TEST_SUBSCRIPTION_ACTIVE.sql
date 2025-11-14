-- ============================================
-- SET TEST SUBSCRIPTION TO ACTIVE (FOR TESTING ONLY)
-- Run this in Supabase SQL Editor to manually set your subscription to 'active'
-- This allows testing subscription features without paying
-- Replace 'YOUR_USER_ID' with your actual user_id
-- ============================================

-- First, find your user_id if you don't know it:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Update subscription to active status for testing
-- Replace 'YOUR_USER_ID' with your actual user_id (UUID)
UPDATE public.subscriptions 
SET status = 'active',
    cycles_completed = 0,  -- Reset cycles for testing
    cancel_at_period_end = false,
    current_period_start = now(),
    current_period_end = now() + interval '1 month',  -- Set period end to 1 month from now
    updated_at = now()
WHERE user_id = 'YOUR_USER_ID'::uuid;

-- If no subscription record exists, create one:
-- INSERT INTO public.subscriptions (
--   user_id,
--   status,
--   cycles_completed,
--   trial_cycles_limit,
--   cancel_at_period_end,
--   current_period_start,
--   current_period_end
-- ) VALUES (
--   'YOUR_USER_ID'::uuid,
--   'active',
--   0,
--   21,
--   false,
--   now(),
--   now() + interval '1 month'
-- );

-- Verify the update
SELECT 
  user_id, 
  status, 
  stripe_customer_id,
  stripe_subscription_id,
  cycles_completed,
  trial_cycles_limit,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  updated_at
FROM public.subscriptions
WHERE user_id = 'YOUR_USER_ID'::uuid;
