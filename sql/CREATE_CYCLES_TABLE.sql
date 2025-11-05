-- ============================================
-- CREATE CYCLES TABLE (Complete Schema)
-- Use this if dropping and recreating the table
-- ============================================

-- Extensions (if not already created)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists (only if you want to start fresh)
DROP TABLE IF EXISTS public.cycles CASCADE;

-- Create the cycles table with correct schema
CREATE TABLE public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cycle_date DATE NOT NULL DEFAULT current_date,
  prime_text TEXT,
  execution_score INT CHECK (execution_score BETWEEN 0 AND 10),
  improve_text TEXT,
  commit_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign key constraint to Supabase Auth users
  CONSTRAINT cycles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- Create index for user_id and cycle_date
CREATE INDEX idx_cycles_user_date 
  ON public.cycles (user_id, cycle_date DESC);

-- Enable Row Level Security
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can only access their own cycles"
ON public.cycles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the table was created correctly:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'cycles'
-- ORDER BY ordinal_position;
-- ============================================

