-- Replace handle_new_user: drop trigger and function, then create new version.
-- Primary roles: admin (never auto-created), customer, investor, professional_service_provider.
-- Auto-create profile + user_roles on signup based on raw_user_meta_data.user_type.

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. New handle_new_user: create profile and one user_role (no admin)
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
  prole public.professional_role;
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

  -- Upsert profile (id, full_name, email, user_type)
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

  -- Map user_type to primary role (customer, professional_service_provider, investor). Never admin.
  prole := CASE utype
    WHEN 'customer' THEN 'customer'::public.professional_role
    WHEN 'service_provider' THEN 'professional_service_provider'::public.professional_role
    WHEN 'business_buyer' THEN 'investor'::public.professional_role
    ELSE NULL
  END;

  IF prole IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, prole)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
