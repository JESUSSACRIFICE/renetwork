-- Customer signup: allow user_type 'customer' and auto-create profile on signup

-- 1. Allow 'customer' in profiles.user_type (drop existing check and re-add)
DO $$
DECLARE
  conname TEXT;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
  WHERE c.conrelid = 'public.profiles'::regclass
    AND c.contype = 'c'
    AND a.attname = 'user_type'
  LIMIT 1;
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('service_provider', 'business_buyer', 'customer'));

-- 2. Function: create a minimal profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta JSONB;
  fname TEXT;
  utype TEXT;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  fname := trim(COALESCE(
    meta->>'full_name',
    NULLIF(trim(COALESCE(meta->>'first_name', '') || ' ' || COALESCE(meta->>'last_name', '')), ''),
    NEW.email,
    'User'
  ));
  IF fname = '' OR fname IS NULL THEN
    fname := COALESCE(NEW.email, 'User');
  END IF;
  utype := NULLIF(trim(COALESCE(meta->>'user_type', '')), '');

  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    NEW.id,
    fname,
    NEW.email,
    CASE WHEN utype IN ('customer', 'service_provider', 'business_buyer') THEN utype ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users (runs after insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
