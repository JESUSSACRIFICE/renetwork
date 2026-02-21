-- Seed data for testing the referral flow
-- ======================================
-- Password for all test users: password123
--
-- Test accounts:
--   referrer@test.local  (Service Provider - Alex Referrer)
--   recipient@test.local (Service Provider - Sam Recipient)
--   customer@test.local  (Customer - Chris Customer)
--
-- How to run:
--   Option A: Supabase Dashboard > SQL Editor > paste and run (requires service role)
--   Option B: supabase db reset (add this file to seed config), or
--   Option C: psql $DATABASE_URL -f supabase/seed_referral_test.sql
--
-- After seeding:
--   1. Log in as recipient@test.local → /dashboard/referrals-in (see pending referral)
--   2. Accept referral, then Create Engagement
--   3. Log in as referrer@test.local → /referral/dashboard (see commission)
--
-- Fixed UUIDs for easy reference
-- referrer:  aaaaaaaa-1111-4000-8000-000000000001
-- recipient: bbbbbbbb-2222-4000-8000-000000000002
-- customer:  cccccccc-3333-4000-8000-000000000003

-- 1. Insert auth users (referrer, recipient, customer)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-1111-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'referrer@test.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"user_type":"service_provider","full_name":"Alex Referrer"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-2222-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'recipient@test.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"user_type":"service_provider","full_name":"Sam Recipient"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-3333-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'customer@test.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"user_type":"customer","full_name":"Chris Customer"}',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert auth.identities (required for login)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  id,
  format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
  'email',
  now(),
  now()
FROM auth.users
WHERE email IN ('referrer@test.local', 'recipient@test.local', 'customer@test.local')
ON CONFLICT (provider, provider_id) DO NOTHING;

-- 3. Ensure profiles exist (handle_new_user trigger may have created them)
INSERT INTO public.profiles (id, full_name, email, user_type)
VALUES
  ('aaaaaaaa-1111-4000-8000-000000000001', 'Alex Referrer', 'referrer@test.local', 'service_provider'),
  ('bbbbbbbb-2222-4000-8000-000000000002', 'Sam Recipient', 'recipient@test.local', 'service_provider'),
  ('cccccccc-3333-4000-8000-000000000003', 'Chris Customer', 'customer@test.local', 'customer')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type;

-- 4. Add user_roles for service providers
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('aaaaaaaa-1111-4000-8000-000000000001', 'professional_service_provider'),
  ('bbbbbbbb-2222-4000-8000-000000000002', 'professional_service_provider')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Message: customer initiated chat with referrer (customer -> referrer)
INSERT INTO public.messages (sender_id, recipient_id, content, subject, read)
SELECT 'cccccccc-3333-4000-8000-000000000003', 'aaaaaaaa-1111-4000-8000-000000000001', 'Hi, I need help with a home purchase in the area.', 'Inquiry', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages
  WHERE sender_id = 'cccccccc-3333-4000-8000-000000000003'
  AND recipient_id = 'aaaaaaaa-1111-4000-8000-000000000001'
  LIMIT 1
);

-- 6. Referral code for referrer
INSERT INTO public.referral_codes (user_id, code)
VALUES ('aaaaaaaa-1111-4000-8000-000000000001', 'REFERRER1')
ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code;

-- 7. Referral: referrer referred customer to recipient (pending_acceptance)
INSERT INTO public.referrals (
  referrer_id,
  recipient_profile_id,
  client_profile_id,
  status,
  notes
)
SELECT
  'aaaaaaaa-1111-4000-8000-000000000001',
  'bbbbbbbb-2222-4000-8000-000000000002',
  'cccccccc-3333-4000-8000-000000000003',
  'pending_acceptance',
  'Client is looking for home purchase consultation. Ready to move forward.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.referrals
  WHERE referrer_id = 'aaaaaaaa-1111-4000-8000-000000000001'
  AND recipient_profile_id = 'bbbbbbbb-2222-4000-8000-000000000002'
  AND client_profile_id = 'cccccccc-3333-4000-8000-000000000003'
  LIMIT 1
);

-- 8. Optional: Add service area for recipient so they appear in search
INSERT INTO public.service_areas (user_id, zip_code, radius_miles, is_primary)
SELECT 'bbbbbbbb-2222-4000-8000-000000000002', '90210', 25, true
WHERE NOT EXISTS (SELECT 1 FROM public.service_areas WHERE user_id = 'bbbbbbbb-2222-4000-8000-000000000002' LIMIT 1);

-- 9. Optional: Add service area for referrer
INSERT INTO public.service_areas (user_id, zip_code, radius_miles, is_primary)
SELECT 'aaaaaaaa-1111-4000-8000-000000000001', '90210', 25, true
WHERE NOT EXISTS (SELECT 1 FROM public.service_areas WHERE user_id = 'aaaaaaaa-1111-4000-8000-000000000001' LIMIT 1);
