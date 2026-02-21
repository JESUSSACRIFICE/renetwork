-- Offer timeline: accepted_at, delivery_started_at for counter

ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_days integer; -- estimated days for delivery

-- Set accepted_at when status changes to accepted (trigger)
CREATE OR REPLACE FUNCTION public.set_offer_accepted_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    NEW.accepted_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_offer_accepted_at ON public.offers;
CREATE TRIGGER trigger_set_offer_accepted_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_offer_accepted_at();
