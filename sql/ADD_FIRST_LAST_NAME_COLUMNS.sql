-- ============================================
-- ADD FIRST_NAME AND LAST_NAME COLUMNS TO USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add first_name and last_name columns
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.user_preferences.first_name IS 'User first name';
COMMENT ON COLUMN public.user_preferences.last_name IS 'User last name';

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences' 
--   AND column_name IN ('first_name', 'last_name')
-- ORDER BY column_name;
-- ============================================

