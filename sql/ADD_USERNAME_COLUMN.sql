-- ============================================
-- ADD USERNAME COLUMN TO USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add username column
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add unique constraint on username (allows NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_username_unique 
ON public.user_preferences (username) 
WHERE username IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_preferences.username IS 'User display name (3-30 characters, alphanumeric + underscore/hyphen)';

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences' 
--   AND column_name = 'username';
--
-- SELECT indexname, indexdef
-- FROM pg_indexes 
-- WHERE tablename = 'user_preferences' 
--   AND indexname = 'idx_user_preferences_username_unique';
-- ============================================

