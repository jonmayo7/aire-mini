-- ============================================
-- ADD THEME_PREFERENCE COLUMN TO USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add theme_preference column
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS theme_preference TEXT 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Add comment for documentation
COMMENT ON COLUMN public.user_preferences.theme_preference IS 'User theme preference: light, dark, or system (follows OS preference)';

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences' 
--   AND column_name = 'theme_preference';
-- ============================================

