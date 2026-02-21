-- Referral Tracking & Commission System
-- Enables tracking of who referred whom, and commission payouts when deals convert

-- Referral codes: unique code per user for shareable links (e.g. ?ref=ABC123XY)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral codes viewable by everyone (for lookup)"
  ON public.referral_codes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral code"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Add referrer_id to leads (who referred this customer to this PSP)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS referrer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_referrer_id ON public.leads(referrer_id);

-- Referrals: tracks each referral event (referrer -> recipient PSP, via lead)
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'closed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_recipient_profile_id ON public.referrals(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_referrals_lead_id ON public.referrals(lead_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Recipients can view referrals to them"
  ON public.referrals FOR SELECT
  USING (auth.uid() = recipient_profile_id);

CREATE POLICY "Referrers can insert own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Referrer or recipient can update referral"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id OR auth.uid() = recipient_profile_id);

-- Referral commissions: payout tracking when referral converts
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_commissions_referral_id ON public.referral_commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_status ON public.referral_commissions(status);

ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- Commission visibility: referrer sees their commissions
CREATE POLICY "Referrers can view own commissions"
  ON public.referral_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_id AND r.referrer_id = auth.uid()
    )
  );

-- Recipients (PSPs) can view commissions on referrals they received (for transparency)
CREATE POLICY "Recipients can view commissions on their referrals"
  ON public.referral_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_id AND r.recipient_profile_id = auth.uid()
    )
  );

-- Recipients (PSPs) can insert commissions when they convert a referred lead
CREATE POLICY "Recipients can insert commissions for their referrals"
  ON public.referral_commissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_id AND r.recipient_profile_id = auth.uid()
    )
  );

-- Recipients can update commission (e.g. notes) for their referrals; status updates typically via admin
CREATE POLICY "Recipients can update commissions for their referrals"
  ON public.referral_commissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_id AND r.recipient_profile_id = auth.uid()
    )
  );

-- Trigger: update updated_at on referrals
CREATE TRIGGER set_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: update updated_at on referral_commissions
CREATE TRIGGER set_referral_commissions_updated_at
  BEFORE UPDATE ON public.referral_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function: generate unique referral code (8 alphanumeric chars)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- exclude ambiguous 0,O,1,I
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function: get or create referral code for user
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = p_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate unique code (retry if collision)
  LOOP
    v_code := public.generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  INSERT INTO public.referral_codes (user_id, code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code;

  RETURN v_code;
END;
$$;

COMMENT ON TABLE public.referral_codes IS 'Unique referral codes for shareable links';
COMMENT ON TABLE public.referrals IS 'Tracks referrals from referrer to recipient PSP via leads';
COMMENT ON TABLE public.referral_commissions IS 'Commission payouts when referrals convert';
