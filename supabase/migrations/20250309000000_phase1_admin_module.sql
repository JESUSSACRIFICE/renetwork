-- Phase-1 Admin Module (requirements-refined-v2)
-- Admin Journey: Approvals, Moderation, Analytics, Dispute Resolution
-- Phase-1 Metrics: Signup→Activation, Referral count, Profile approval, 7-14 day return

-- 1. Profile approval for PSP (Admin Approval workflow)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'pending'
  CHECK (registration_status IN ('pending', 'under_review', 'approved', 'rejected'));

-- Backfill: existing service_provider profiles as approved (so they're visible)
UPDATE public.profiles
SET registration_status = 'approved'
WHERE user_type = 'service_provider' AND (registration_status IS NULL OR registration_status = 'pending');

-- Update handle_new_user to set registration_status = 'pending' for new service_providers
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
  reg_status TEXT;
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
  reg_status := CASE WHEN utype = 'service_provider' THEN 'pending' ELSE NULL END;

  INSERT INTO public.profiles (id, full_name, email, user_type, registration_status)
  VALUES (
    NEW.id,
    fname,
    NEW.email,
    CASE WHEN utype IN ('customer', 'service_provider', 'business_buyer') THEN utype ELSE NULL END,
    reg_status
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
    registration_status = COALESCE(EXCLUDED.registration_status, profiles.registration_status),
    updated_at = NOW();

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

-- 2. Referral lifecycle: add 'archived' (Created→Pending→Active→Closed→Archived)
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('pending_acceptance', 'accepted', 'converted', 'closed', 'cancelled', 'archived'));

-- 3. Referral/Commission disputes (Dispute Resolution)
CREATE TABLE IF NOT EXISTS public.referral_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  commission_id uuid REFERENCES public.referral_commissions(id) ON DELETE SET NULL,
  raised_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  admin_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_disputes_referral ON public.referral_disputes(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_disputes_status ON public.referral_disputes(status);

ALTER TABLE public.referral_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disputes"
  ON public.referral_disputes FOR SELECT
  USING (auth.uid() = raised_by);

CREATE POLICY "Users can insert own disputes"
  ON public.referral_disputes FOR INSERT
  WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Admins can manage all disputes"
  ON public.referral_disputes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

CREATE TRIGGER set_referral_disputes_updated_at
  BEFORE UPDATE ON public.referral_disputes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Phase-1 metrics (aggregated, updated by triggers or cron - for now we query live)
-- No separate table; analytics computed from profiles, referrals, user_roles

COMMENT ON COLUMN public.profiles.registration_status IS 'PSP approval: pending, under_review, approved, rejected';
COMMENT ON TABLE public.referral_disputes IS 'Dispute resolution for referrals/commissions';
