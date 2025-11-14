-- ============================================
-- MANUAL SUBSCRIPTION UPDATE
-- Use this when webhook didn't process correctly
-- ============================================
-- 
-- STEP 1: Get your Stripe Subscription ID from Stripe Dashboard:
--   1. Go to https://dashboard.stripe.com/subscriptions
--   2. Find your subscription (look for customer email or recent date)
--   3. Copy the Subscription ID (starts with 'sub_')
--
-- STEP 2: Get your Stripe Customer ID from Stripe Dashboard:
--   1. Go to https://dashboard.stripe.com/customers
--   2. Find your customer (by email)
--   3. Copy the Customer ID (starts with 'cus_')
--
-- STEP 3: Run this SQL with your actual IDs:

UPDATE public.subscriptions 
SET 
  status = 'active',
  stripe_customer_id = 'cus_YOUR_CUSTOMER_ID',  -- Replace with actual customer ID
  stripe_subscription_id = 'sub_YOUR_SUBSCRIPTION_ID',  -- Replace with actual subscription ID
  current_period_start = now(),  -- Or use actual period start from Stripe
  current_period_end = (now() + interval '1 month'),  -- Or use actual period end from Stripe
  updated_at = now()
WHERE user_id = '89892211-59d1-461d-81d9-0de4177f4504';

-- STEP 4: Verify the update
SELECT 
  user_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  cycles_completed,
  current_period_start,
  current_period_end,
  updated_at
FROM public.subscriptions
WHERE user_id = '89892211-59d1-461d-81d9-0de4177f4504';

