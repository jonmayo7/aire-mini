-- ============================================
-- ADD SMS COMPLIANCE FIELDS TO USER_PREFERENCES TABLE
-- Run this in Supabase SQL Editor
-- Mission 11: SMS Functionality Compliance
-- ============================================

-- Add SMS compliance fields
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS sms_opted_out BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferences_saved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS optin_sms_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add comment to columns for documentation
COMMENT ON COLUMN public.user_preferences.sms_opted_out IS 'Flag indicating if user has opted out of SMS notifications (STOP keyword)';
COMMENT ON COLUMN public.user_preferences.preferences_saved_at IS 'Timestamp when user saved notification preferences (consent timestamp)';
COMMENT ON COLUMN public.user_preferences.optin_sms_received_at IS 'Timestamp when user sent JOIN keyword via SMS (double opt-in)';
COMMENT ON COLUMN public.user_preferences.ip_address IS 'IP address captured at time of consent (for audit trail)';
COMMENT ON COLUMN public.user_preferences.user_agent IS 'User agent captured at time of consent (for audit trail)';

-- Create index for SMS opt-out queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_sms_opted_out 
  ON public.user_preferences (sms_opted_out) 
  WHERE sms_opted_out = false;

-- Create index for SMS opt-in timestamp queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_optin_sms 
  ON public.user_preferences (optin_sms_received_at) 
  WHERE optin_sms_received_at IS NOT NULL;

-- Update existing rows to set preferences_saved_at to created_at if null
UPDATE public.user_preferences
SET preferences_saved_at = created_at
WHERE preferences_saved_at IS NULL;

-- ============================================
-- VERIFICATION (Optional - run to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences'
-- ORDER BY ordinal_position;
--
-- SELECT 
--   user_id,
--   phone,
--   notification_method,
--   sms_opted_out,
--   preferences_saved_at,
--   optin_sms_received_at
-- FROM user_preferences
-- WHERE phone IS NOT NULL
-- LIMIT 5;

