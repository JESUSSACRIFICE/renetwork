# How to Verify Tables Are Created in Supabase

## Method 1: Using Supabase Dashboard - Table Editor (Easiest)

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project: **gqfrsptqctkxbrttyrxc**

2. **Open Table Editor**
   - In the left sidebar, click on **"Table Editor"**
   - You'll see a list of all your tables

3. **View Your Tables**
   - All tables in the `public` schema will be listed
   - Click on any table name to see:
     - Table structure (columns, data types)
     - Sample data (if any exists)
     - Row count

### What You Should See:

After running all migrations, you should see these tables:

✅ **Core Tables:**
- `profiles`
- `user_roles`
- `service_areas`
- `payment_preferences`

✅ **Registration Tables:**
- `identity_documents`
- `licenses_credentials`
- `bonds_insurance`
- `e_signatures`
- `preference_rankings`
- `buyer_preferences`
- `buyer_basic_info`
- `demography_maintenance_plans`
- `onboarding_steps`

✅ **Communication Tables:**
- `leads`
- `messages`
- `favorites`
- `saved_searches`
- `reviews`

✅ **Community Tables:**
- `sponsors`
- `groups`
- `group_members`
- `forum_posts`
- `forum_replies`
- `hot_topics`
- `awards`

---

## Method 2: Using SQL Editor - Query Tables

### Step-by-Step:

1. **Open SQL Editor**
   - In Supabase Dashboard, click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

2. **Run This Query to List All Tables:**

```sql
-- List all tables in the public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

3. **Or Check Specific Table Exists:**

```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);
```

4. **View Table Structure:**

```sql
-- See columns and data types for a specific table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

---

## Method 3: Using SQL Editor - Count Tables

### Quick Check:

Run this to see how many tables you have:

```sql
-- Count all tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected Result:** Should show around 25+ tables after all migrations

---

## Method 4: Check Specific Table Details

### View Complete Table Information:

```sql
-- Get detailed info about a specific table
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name = 'profiles'
ORDER BY c.ordinal_position;
```

---

## Method 5: Verify in Your Application

### Check Connection Status:

1. **Go to your app's registration page**
   - Navigate to: `http://localhost:3000/register` (or your app URL)
   - Look for the **"Supabase Connection Status"** card

2. **What to Look For:**
   - ✅ **Green checkmark** = Connected and tables exist
   - ⚠️ **Yellow warning** = Connected but table may be missing
   - ❌ **Red X** = Connection failed or table doesn't exist

---

## Quick Verification Checklist

After running migrations, verify these key tables exist:

### ✅ Essential Tables (Must Have):

- [ ] `profiles` - Main user profile table
- [ ] `buyer_basic_info` - Business buyer information
- [ ] `buyer_preferences` - Buyer preferences
- [ ] `demography_maintenance_plans` - Payment preferences
- [ ] `e_signatures` - Electronic signatures
- [ ] `identity_documents` - ID documents
- [ ] `licenses_credentials` - Licenses and credentials

### ✅ Supporting Tables:

- [ ] `user_roles` - User role assignments
- [ ] `service_areas` - Service area definitions
- [ ] `payment_preferences` - Payment settings
- [ ] `leads` - Contact leads
- [ ] `messages` - Direct messages
- [ ] `reviews` - User reviews

---

## Troubleshooting

### If Table Doesn't Appear:

1. **Check Schema:**
   ```sql
   -- Make sure you're looking in the right schema
   SELECT table_schema, table_name
   FROM information_schema.tables
   WHERE table_name = 'profiles';
   ```
   Should show `table_schema = 'public'`

2. **Check for Errors:**
   - Go to SQL Editor → Check "History" tab
   - Look for any error messages from your migrations

3. **Re-run Migration:**
   - If table is missing, re-run the specific migration
   - Use `CREATE TABLE IF NOT EXISTS` to avoid errors

4. **Check Permissions:**
   - Make sure you're logged in as the project owner/admin
   - Some tables might be hidden if you don't have proper permissions

---

## Visual Guide: Where to Find Tables

```
Supabase Dashboard
├── Table Editor ← CLICK HERE (Easiest way!)
│   ├── public.profiles
│   ├── public.buyer_basic_info
│   ├── public.buyer_preferences
│   └── ... (all your tables)
│
├── SQL Editor ← Use queries to verify
│   └── Run: SELECT table_name FROM information_schema.tables
│
└── Database
    └── Tables (alternative view)
```

---

## Quick SQL Commands Reference

```sql
-- 1. List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check if specific table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
);

-- 3. Count total tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- 4. View table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 5. List all tables with row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Summary

**Easiest Method:** 
1. Go to Supabase Dashboard
2. Click "Table Editor" in left sidebar
3. See all your tables listed ✅

**Alternative Method:**
1. Go to SQL Editor
2. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
3. See list of all tables ✅

**Quick Check:**
- Look for `profiles` table in Table Editor
- If it exists, your migrations worked! ✅

