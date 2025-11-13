-- ============================================
-- CREATE SUBSCRIPTIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  cycles_completed INT NOT NULL DEFAULT 0,
  trial_cycles_limit INT NOT NULL DEFAULT 14,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign key constraint to Supabase Auth users
  CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  
  -- Ensure one subscription record per user
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
  ON public.subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON public.subscriptions (status);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only access their own subscriptions
DROP POLICY IF EXISTS "Users can only access their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can only access their own subscriptions"
ON public.subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;
--
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'subscriptions';
--
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'subscriptions';
-- ============================================

