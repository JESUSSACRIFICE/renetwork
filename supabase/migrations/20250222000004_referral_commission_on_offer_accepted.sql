-- Commission triggers when recipient creates an OFFER with referred client and client accepts
-- (Replaces engagement-based commission trigger)

-- 1. Drop the engagement-based commission trigger
DROP TRIGGER IF EXISTS engagement_convert_referral ON public.engagements;

-- 2. Create trigger on offers: when status becomes 'accepted' or 'completed',
--    find matching referral (recipient=provider, client=client) and create commission
CREATE OR REPLACE FUNCTION public.on_offer_accepted_convert_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_id uuid;
  v_commission_cents int := 2500;  -- $25 default
BEGIN
  -- Only fire when status changes TO accepted or completed
  IF NEW.status NOT IN ('accepted', 'completed') THEN
    RETURN NEW;
  END IF;
  IF OLD.status IN ('accepted', 'completed') THEN
    RETURN NEW;  -- Already converted
  END IF;

  -- Find accepted referral: provider (sender) = recipient_profile_id, client (recipient) = client_profile_id
  SELECT id INTO v_referral_id
  FROM public.referrals
  WHERE recipient_profile_id = NEW.sender_id
    AND client_profile_id = NEW.recipient_id
    AND status = 'accepted'
  LIMIT 1;

  IF v_referral_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Prevent duplicate commission
  IF EXISTS (SELECT 1 FROM public.referral_commissions WHERE referral_id = v_referral_id) THEN
    RETURN NEW;
  END IF;

  -- Update referral to converted
  UPDATE public.referrals
  SET status = 'converted', updated_at = NOW()
  WHERE id = v_referral_id;

  -- Create commission
  INSERT INTO public.referral_commissions (referral_id, amount_cents, status)
  VALUES (v_referral_id, v_commission_cents, 'pending');

  RETURN NEW;
END;
$$;

CREATE TRIGGER offer_accepted_convert_referral
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status
    AND NEW.status IN ('accepted', 'completed')
  )
  EXECUTE FUNCTION public.on_offer_accepted_convert_referral();

COMMENT ON FUNCTION public.on_offer_accepted_convert_referral IS 'Creates referral commission when provider sends offer to referred client and client accepts';
