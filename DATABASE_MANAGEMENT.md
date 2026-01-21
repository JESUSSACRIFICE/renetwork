# Database Management Guide: Editing and Modifying Tables

## Yes, You Can Modify Tables After Creation!

After running migrations, you can always:
- ✅ **Modify existing tables** (add/remove columns, change data types)
- ✅ **Delete tables** (if you need to recreate them)
- ✅ **Create new migrations** for schema changes
- ✅ **Re-run migrations** (with proper handling)

---

## Method 1: Modify Existing Tables (Recommended)

### Adding a New Column

If you need to add a column to an existing table:

```sql
-- Add a new column to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN new_field_name TEXT;

-- Or with a default value
ALTER TABLE public.profiles 
  ADD COLUMN new_field_name TEXT DEFAULT 'default_value';

-- Or make it NOT NULL (only if table is empty or you provide a default)
ALTER TABLE public.profiles 
  ADD COLUMN new_field_name TEXT NOT NULL DEFAULT 'default_value';
```

### Removing a Column

```sql
-- Remove a column (WARNING: This deletes all data in that column!)
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS column_name;
```

### Modifying Column Type

```sql
-- Change column data type (be careful with existing data!)
ALTER TABLE public.profiles 
  ALTER COLUMN column_name TYPE NEW_TYPE;

-- Example: Change TEXT to VARCHAR(255)
ALTER TABLE public.profiles 
  ALTER COLUMN full_name TYPE VARCHAR(255);
```

### Renaming a Column

```sql
ALTER TABLE public.profiles 
  RENAME COLUMN old_name TO new_name;
```

### Adding Constraints

```sql
-- Add a CHECK constraint
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add a UNIQUE constraint
ALTER TABLE public.profiles 
  ADD CONSTRAINT unique_email UNIQUE (email);
```

---

## Method 2: Delete and Recreate Tables

### ⚠️ WARNING: This Will Delete All Data!

If you need to completely recreate a table:

```sql
-- Step 1: Drop the table (deletes all data!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Recreate it with your new schema
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  -- ... your new schema
);
```

### Safe Approach: Backup First

```sql
-- Step 1: Create a backup table
CREATE TABLE public.profiles_backup AS 
SELECT * FROM public.profiles;

-- Step 2: Drop the original
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 3: Recreate with new schema
CREATE TABLE public.profiles (
  -- new schema
);

-- Step 4: Restore data (if compatible)
INSERT INTO public.profiles (id, full_name, ...)
SELECT id, full_name, ... FROM public.profiles_backup;

-- Step 5: Drop backup when done
DROP TABLE public.profiles_backup;
```

---

## Method 3: Create New Migration Files (Best Practice)

The **best practice** is to create new migration files for changes:

### Step 1: Create a New Migration File

Create a new file in `supabase/migrations/` with a timestamp:

```
supabase/migrations/20250115000000_add_new_fields.sql
```

### Step 2: Write Your Changes

```sql
-- Migration: Add new fields to profiles table
-- Date: 2025-01-15

-- Add new columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS new_field_1 TEXT,
  ADD COLUMN IF NOT EXISTS new_field_2 INTEGER,
  ADD COLUMN IF NOT EXISTS new_field_3 BOOLEAN DEFAULT false;

-- Modify existing column (if needed)
ALTER TABLE public.profiles 
  ALTER COLUMN existing_field TYPE VARCHAR(500);

-- Add new index
CREATE INDEX IF NOT EXISTS idx_profiles_new_field 
  ON public.profiles(new_field_1);

-- Update RLS policies if needed
CREATE POLICY "New policy name"
  ON public.profiles FOR SELECT
  USING (new_field_1 IS NOT NULL);
```

### Step 3: Run the Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste your new migration SQL
3. Click "Run"

---

## Common Scenarios

### Scenario 1: Add a New Field to Existing Table

**Example:** Add `middle_name` to `profiles` table

```sql
-- In Supabase SQL Editor
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS middle_name TEXT;
```

### Scenario 2: Change Field Type

**Example:** Change `phone` from TEXT to VARCHAR(20)

```sql
-- First, ensure all existing data fits the new type
-- Then modify:
ALTER TABLE public.profiles 
  ALTER COLUMN phone TYPE VARCHAR(20);
```

### Scenario 3: Remove a Field

**Example:** Remove `old_field` from `profiles`

```sql
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS old_field;
```

### Scenario 4: Add a New Table

**Example:** Create a new `notifications` table

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
```

### Scenario 5: Modify Existing Table Structure

**Example:** Add multiple fields and constraints

```sql
-- Add multiple columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS field1 TEXT,
  ADD COLUMN IF NOT EXISTS field2 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS field3 BOOLEAN DEFAULT false;

-- Add constraint
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_field2_positive 
  CHECK (field2 >= 0);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_field1 
  ON public.profiles(field1);
```

---

## Re-running Migrations

### Can You Re-run a Migration?

**Yes, but with caution:**

1. **If using `IF NOT EXISTS`**: Safe to re-run
   ```sql
   CREATE TABLE IF NOT EXISTS public.profiles (...);
   -- This won't error if table already exists
   ```

2. **If NOT using `IF NOT EXISTS`**: Will error if already exists
   ```sql
   CREATE TABLE public.profiles (...);
   -- This will error: "relation already exists"
   ```

### Best Practice: Always Use `IF NOT EXISTS`

```sql
-- ✅ Good - Safe to re-run
CREATE TABLE IF NOT EXISTS public.profiles (...);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS new_field TEXT;
CREATE INDEX IF NOT EXISTS idx_name ON public.profiles(field);

-- ❌ Bad - Will error on re-run
CREATE TABLE public.profiles (...);
ALTER TABLE public.profiles ADD COLUMN new_field TEXT;
CREATE INDEX idx_name ON public.profiles(field);
```

---

## Handling Data When Making Changes

### Adding NOT NULL Column to Table with Existing Data

```sql
-- Step 1: Add column as nullable first
ALTER TABLE public.profiles 
  ADD COLUMN new_required_field TEXT;

-- Step 2: Update existing rows with default value
UPDATE public.profiles 
SET new_required_field = 'default_value' 
WHERE new_required_field IS NULL;

-- Step 3: Now make it NOT NULL
ALTER TABLE public.profiles 
  ALTER COLUMN new_required_field SET NOT NULL;
```

### Changing Column Type Safely

```sql
-- Example: Change TEXT to INTEGER
-- Step 1: Add new column
ALTER TABLE public.profiles 
  ADD COLUMN new_field_int INTEGER;

-- Step 2: Migrate data
UPDATE public.profiles 
SET new_field_int = CAST(old_field_text AS INTEGER)
WHERE old_field_text ~ '^[0-9]+$';

-- Step 3: Drop old column
ALTER TABLE public.profiles 
  DROP COLUMN old_field_text;

-- Step 4: Rename new column
ALTER TABLE public.profiles 
  RENAME COLUMN new_field_int TO field_name;
```

---

## Rollback Strategy

### If You Make a Mistake

```sql
-- Option 1: Drop the column you just added
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS mistake_field;

-- Option 2: Revert column type
ALTER TABLE public.profiles 
  ALTER COLUMN field_name TYPE TEXT;

-- Option 3: Drop constraint
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS constraint_name;
```

### Using Transactions (Advanced)

```sql
-- Start transaction
BEGIN;

-- Make changes
ALTER TABLE public.profiles ADD COLUMN test_field TEXT;

-- If something goes wrong, rollback:
ROLLBACK;

-- If everything is good, commit:
COMMIT;
```

---

## Quick Reference: Common ALTER TABLE Commands

```sql
-- Add column
ALTER TABLE table_name ADD COLUMN column_name TYPE;

-- Drop column
ALTER TABLE table_name DROP COLUMN column_name;

-- Rename column
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;

-- Change column type
ALTER TABLE table_name ALTER COLUMN column_name TYPE new_type;

-- Set default value
ALTER TABLE table_name ALTER COLUMN column_name SET DEFAULT value;

-- Remove default
ALTER TABLE table_name ALTER COLUMN column_name DROP DEFAULT;

-- Set NOT NULL
ALTER TABLE table_name ALTER COLUMN column_name SET NOT NULL;

-- Remove NOT NULL
ALTER TABLE table_name ALTER COLUMN column_name DROP NOT NULL;

-- Add constraint
ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition);

-- Drop constraint
ALTER TABLE table_name DROP CONSTRAINT constraint_name;

-- Rename table
ALTER TABLE old_name RENAME TO new_name;
```

---

## Best Practices

1. **Always use `IF NOT EXISTS`** for CREATE statements
2. **Always use `IF EXISTS`** for DROP statements
3. **Create new migration files** for schema changes
4. **Test migrations** on a development database first
5. **Backup data** before major changes
6. **Use transactions** for complex changes
7. **Document changes** in migration file comments

---

## Example: Complete Migration for Adding Features

```sql
-- Migration: Add social media fields to profiles
-- Date: 2025-01-15
-- Description: Add Twitter, LinkedIn, and Instagram fields

-- Add new columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Add constraint for URL format
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_linkedin_url 
  CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/.*$');

-- Add index for searching
CREATE INDEX IF NOT EXISTS idx_profiles_twitter 
  ON public.profiles(twitter_handle) 
  WHERE twitter_handle IS NOT NULL;

-- Update RLS policy if needed
-- (Add to existing policies or create new ones)
```

---

## Summary

✅ **You CAN modify tables** - Use `ALTER TABLE` commands  
✅ **You CAN delete tables** - Use `DROP TABLE` (backup first!)  
✅ **You CAN re-run migrations** - Use `IF NOT EXISTS` for safety  
✅ **Best practice** - Create new migration files for changes  
✅ **Always backup** - Before major changes  

**Remember:** Changes to your database schema should match changes in your code. Update both together!




