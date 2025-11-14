-- ============================================
-- VERIFY SUBSCRIPTION STATUS
-- Run this to check current subscription status
-- ============================================

SELECT 
  user_id,
  status,
  stripe_subscription_id,
  cycles_completed,
  trial_cycles_limit,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  updated_at
FROM public.subscriptions
WHERE user_id = '89892211-59d1-461d-81d9-0de4177f4504';

-- Expected result after fix:
-- status should be 'active'
-- stripe_subscription_id should NOT be null
-- current_period_end should have a date

