-- Referral flow: client profile, recipient acceptance, objective conversion via engagement
-- 1. Referrer shares client's profile + context (no manual client entry)
-- 2. Recipient accepts referral
-- 3. Conversion = when recipient creates engagement/contract (not manual)

-- Add client_profile_id and new statuses to referrals
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS client_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_referrals_client_profile_id ON public.referrals(client_profile_id);

-- Drop old check and add new statuses: pending_acceptance, accepted, converted, closed, cancelled
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('pending_acceptance', 'accepted', 'converted', 'closed', 'cancelled'));

-- Migrate existing 'pending' to 'pending_acceptance'
UPDATE public.referrals SET status = 'pending_acceptance' WHERE status = 'pending';

-- Engagements: contract/project between provider and client. Creation = conversion trigger.
CREATE TABLE IF NOT EXISTS public.engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  title text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagements_provider_id ON public.engagements(provider_id);
CREATE INDEX IF NOT EXISTS idx_engagements_client_id ON public.engagements(client_id);
CREATE INDEX IF NOT EXISTS idx_engagements_referral_id ON public.engagements(referral_id);

ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage own engagements"
  ON public.engagements FOR ALL
  USING (auth.uid() = provider_id);

CREATE POLICY "Clients can view own engagements"
  ON public.engagements FOR SELECT
  USING (auth.uid() = client_id);

CREATE TRIGGER set_engagements_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: when engagement created with referral_id, convert referral and create commission
CREATE OR REPLACE FUNCTION public.on_engagement_created_convert_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_commission_cents int := 2500;  -- $25 default
BEGIN
  IF NEW.referral_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_referral FROM public.referrals WHERE id = NEW.referral_id;
  IF NOT FOUND OR v_referral.status = 'converted' THEN
    RETURN NEW;
  END IF;

  -- Update referral to converted
  UPDATE public.referrals
  SET status = 'converted', updated_at = NOW()
  WHERE id = NEW.referral_id;

  -- Create commission
  INSERT INTO public.referral_commissions (referral_id, amount_cents, status)
  VALUES (NEW.referral_id, v_commission_cents, 'pending');

  RETURN NEW;
END;
$$;

CREATE TRIGGER engagement_convert_referral
  AFTER INSERT ON public.engagements
  FOR EACH ROW
  WHEN (NEW.referral_id IS NOT NULL)
  EXECUTE FUNCTION public.on_engagement_created_convert_referral();

COMMENT ON TABLE public.engagements IS 'Contract/project between provider and client. Creation with referral_id triggers commission.';
