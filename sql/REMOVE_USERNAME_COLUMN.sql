-- ============================================
-- REMOVE USERNAME COLUMN FROM USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor AFTER adding first_name/last_name
-- ============================================

-- Drop the unique index on username first
DROP INDEX IF EXISTS public.idx_user_preferences_username_unique;

-- Remove username column
ALTER TABLE public.user_preferences 
DROP COLUMN IF EXISTS username;

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences' 
-- ORDER BY ordinal_position;
-- ============================================

