-- ============================================
-- CREATE USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  preferred_notification_time TIME,
  notification_method TEXT CHECK (notification_method IN ('email', 'sms', 'both')),
  theme_preference TEXT CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign key constraint to Supabase Auth users
  CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  
  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON public.user_preferences (user_id);

-- Create index for notification time (for cron job queries)
CREATE INDEX IF NOT EXISTS idx_user_preferences_notification_time 
ON public.user_preferences (preferred_notification_time);


-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only access their own preferences
DROP POLICY IF EXISTS "Users can only access their own preferences" ON public.user_preferences;

CREATE POLICY "Users can only access their own preferences"
ON public.user_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences'
-- ORDER BY ordinal_position;
--
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'user_preferences';
--
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'user_preferences';
-- ============================================

