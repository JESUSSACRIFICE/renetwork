# How to Verify Data Submitted to Supabase

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `gqfrsptqctkxbrttyrxc`

### Step 2: Navigate to Table Editor
1. Click on **Table Editor** in the left sidebar
2. You'll see all your database tables

### Step 3: Check Registration Data

#### For Service Provider Registration:
Check these tables:

1. **profiles** table:
   - Look for your user ID (from auth.users)
   - Check columns:
     - `user_type` should be `"service_provider"`
     - `registration_status` should be `"pending"` (or other status)
     - `first_name`, `last_name`, `full_name`
     - `email`, `phone`, `mailing_address`
     - `business_name`, `business_address` (if provided)

2. **identity_documents** table:
   - Filter by `user_id` = your user ID
   - Should have at least one record if files were uploaded

3. **licenses_credentials** table:
   - Filter by `user_id` = your user ID
   - Should have records if license files were uploaded

4. **bonds_insurance** table:
   - Filter by `user_id` = your user ID
   - Should have records if insurance files were uploaded

5. **payment_preferences** table:
   - Filter by `user_id` = your user ID
   - Should have one record with payment methods

6. **preference_rankings** table:
   - Filter by `user_id` = your user ID
   - Should have records for each category ranked

7. **e_signatures** table:
   - Filter by `user_id` = your user ID
   - Should have records for signed documents

#### For Business Buyer Registration:
Check these tables:

1. **profiles** table:
   - `user_type` should be `"business_buyer"`
   - `registration_status` should be `"pending"`
   - `full_name`, `company_name`, `email`, `phone`

2. **buyer_basic_info** table:
   - Filter by `user_id` = your user ID
   - Should have one record with business details

3. **buyer_preferences** table:
   - Filter by `user_id` = your user ID
   - Should have one record with property preferences

4. **demography_maintenance_plans** table:
   - Filter by `user_id` = your user ID
   - Should have one record with payment preferences

5. **e_signatures** table:
   - Filter by `user_id` = your user ID
   - Should have records for signed documents

## Method 2: Using SQL Editor

Run these queries in Supabase SQL Editor:

### Check Your Profile:
```sql
SELECT 
  id,
  user_type,
  registration_status,
  first_name,
  last_name,
  full_name,
  email,
  phone,
  created_at
FROM profiles
WHERE id = 'YOUR_USER_ID_HERE';
```

### Check Service Provider Data:
```sql
-- Check payment preferences
SELECT * FROM payment_preferences WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check preference rankings
SELECT * FROM preference_rankings WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check e-signatures
SELECT * FROM e_signatures WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check identity documents
SELECT * FROM identity_documents WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check licenses
SELECT * FROM licenses_credentials WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Check Business Buyer Data:
```sql
-- Check buyer basic info
SELECT * FROM buyer_basic_info WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check buyer preferences
SELECT * FROM buyer_preferences WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check maintenance plans
SELECT * FROM demography_maintenance_plans WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Method 3: Find Your User ID

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Find your email address
3. Copy the **UUID** (this is your user_id)
4. Use this ID in the queries above

## What to Look For

### Minimum Required Data for Dashboard Access:

**Service Provider:**
- ✅ Profile with `user_type = "service_provider"`
- ✅ `registration_status` set (any value: pending, approved, etc.)
- OR at least one of:
  - `payment_preferences` record
  - `preference_rankings` record
  - `e_signatures` record
  - `first_name` AND `last_name` in profile

**Business Buyer:**
- ✅ Profile with `user_type = "business_buyer"`
- ✅ `registration_status` set
- OR at least one of:
  - `buyer_basic_info` record
  - `demography_maintenance_plans` record
  - `full_name` in profile

## Troubleshooting

### If you don't see data:
1. Check if you're looking at the correct user_id
2. Verify the form submission completed (check browser console for errors)
3. Check if you're in mock mode (data might be in localStorage instead)
4. Verify Supabase connection is working

### If data exists but still can't access dashboard:
1. Check browser console (F12) for `[REGISTRATION CHECK]` logs
2. Verify `registration_status` is set in profiles table
3. Check if `user_type` matches your registration type
4. Ensure `first_name` and `last_name` exist (for service provider) or `full_name` exists (for business buyer)

