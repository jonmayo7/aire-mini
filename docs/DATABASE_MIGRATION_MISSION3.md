# Database Migration for Mission 3: JWT Auth

## ⚠️ USER ACTION REQUIRED: Run These SQL Commands in Supabase

**Location:** Supabase Dashboard → Your Project → SQL Editor

**Important:** 
- If you have existing data in the `cycles` table, this migration will require data cleanup
- If the table is empty (no production data), you can run all commands safely
- Read through each step before executing

---

## Step 1: Check Current State

Run this first to see what you're working with:

```sql
-- Check current table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cycles';

-- Check if there's existing data
SELECT COUNT(*) FROM cycles;
```

---

## Step 2: Migration Strategy

**If table is EMPTY (no data):**
- Run the "Clean Migration" below (Step 3)

**If table has DATA:**
- You'll need to decide how to handle existing records
- Option A: Delete all existing data (if test data)
- Option B: Migrate existing data (requires mapping old IDs to new user IDs - complex)

---

## Step 3: Clean Migration (No Existing Data)

If your `cycles` table is empty or you're okay deleting existing data:

```sql
-- Step 3a: Drop old column if it exists
ALTER TABLE cycles DROP COLUMN IF EXISTS tg_user_id;

-- Step 3b: Add new user_id column (uuid type)
ALTER TABLE cycles ADD COLUMN user_id UUID;

-- Step 3c: Make user_id NOT NULL (after migration)
ALTER TABLE cycles ALTER COLUMN user_id SET NOT NULL;

-- Step 3d: Add foreign key constraint to auth.users (optional but recommended)
ALTER TABLE cycles 
ADD CONSTRAINT cycles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

---

## Step 4: Migration with Existing Data (If Needed)

**⚠️ WARNING:** This is complex. Only use if you need to preserve existing data.

If you have existing data and need to preserve it, you'll need to:
1. Map old `tg_user_id` values to Supabase Auth `user_id` values
2. This typically requires manual mapping or a script

**Simplified approach (if you can identify which old IDs map to which users):**

```sql
-- Step 4a: Add new user_id column (nullable first)
ALTER TABLE cycles ADD COLUMN user_id UUID;

-- Step 4b: Manually update rows (example - YOU MUST FILL IN THE MAPPING)
-- UPDATE cycles SET user_id = 'uuid-from-auth-users' WHERE tg_user_id = old_id;

-- Step 4c: Delete rows that can't be mapped
-- DELETE FROM cycles WHERE user_id IS NULL;

-- Step 4d: Make user_id NOT NULL
ALTER TABLE cycles ALTER COLUMN user_id SET NOT NULL;

-- Step 4e: Drop old column
ALTER TABLE cycles DROP COLUMN tg_user_id;

-- Step 4f: Add foreign key constraint
ALTER TABLE cycles 
ADD CONSTRAINT cycles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

---

## Step 5: Update RLS Policy

After migration, run this to set up Row Level Security:

```sql
-- Drop old policy if it exists
DROP POLICY IF EXISTS "Users can only access their own cycles" ON cycles;

-- Create new policy for authenticated users
CREATE POLICY "Users can only access their own cycles"
ON cycles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Policy Explanation:**
- `USING`: Controls which rows users can SELECT/UPDATE/DELETE
- `WITH CHECK`: Controls which rows users can INSERT/UPDATE
- `auth.uid()`: Returns the current authenticated user's ID from Supabase Auth

---

## Step 6: Verify Migration

Run these checks to ensure everything worked:

```sql
-- Check column structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cycles'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cycles';

-- Check policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'cycles';
```

---

## Step 7: Test RLS Policy

After migration, test that RLS works:

1. **As User A:**
   - Insert a cycle → Should succeed
   - Select cycles → Should only see User A's cycles

2. **As User B:**
   - Insert a cycle → Should succeed  
   - Select cycles → Should only see User B's cycles (not User A's)

---

## Troubleshooting

**Error: "column does not exist"**
- Make sure you're using the correct column name
- Check if the column was already renamed

**Error: "violates foreign key constraint"**
- Ensure user_id values exist in auth.users table
- Check that you're using valid UUIDs from Supabase Auth

**Error: "permission denied"**
- Make sure you're running SQL as the database owner
- Check that RLS policies are correctly configured

---

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Remove new column
ALTER TABLE cycles DROP COLUMN IF EXISTS user_id;

-- Re-add old column (if you need it)
ALTER TABLE cycles ADD COLUMN tg_user_id INT8;

-- Drop new policy
DROP POLICY IF EXISTS "Users can only access their own cycles" ON cycles;
```

**Note:** This will lose any data in the user_id column, so only use if absolutely necessary.

