-- ============================================
-- UPDATE SUBSCRIPTION FOR TESTING
-- Run this in Supabase SQL Editor
-- Replace 'ea9c2fc8-e2c3-454e-a870-f7913e437500' with your actual user_id
-- ============================================

-- Single UPSERT statement (recommended approach)
INSERT INTO public.subscriptions (user_id, status, cycles_completed, trial_cycles_limit)
VALUES ('ea9c2fc8-e2c3-454e-a870-f7913e437500', 'trialing', 12, 14)
ON CONFLICT (user_id) 
DO UPDATE SET
  cycles_completed = 12,
  status = 'trialing',
  trial_cycles_limit = 14,
  updated_at = now();

-- ============================================
-- ALTERNATIVE: If you prefer separate UPDATE/INSERT
-- ============================================
-- First, try UPDATE (if record exists)
-- UPDATE public.subscriptions 
-- SET cycles_completed = 12, 
--     status = 'trialing',
--     trial_cycles_limit = 14,
--     updated_at = now()
-- WHERE user_id = 'ea9c2fc8-e2c3-454e-a870-f7913e437500';
--
-- Then, if no rows were updated, INSERT (if record doesn't exist)
-- INSERT INTO public.subscriptions (user_id, status, cycles_completed, trial_cycles_limit)
-- VALUES ('ea9c2fc8-e2c3-454e-a870-f7913e437500', 'trialing', 12, 14)
-- ON CONFLICT (user_id) DO NOTHING;

