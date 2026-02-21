-- Only one pending offer per sender->recipient at a time
-- Provider must wait for customer to accept or decline before sending another

CREATE OR REPLACE FUNCTION public.check_one_pending_offer_per_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    IF EXISTS (
      SELECT 1 FROM public.offers
      WHERE sender_id = NEW.sender_id
        AND recipient_id = NEW.recipient_id
        AND status = 'pending'
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'You already have a pending offer to this customer. Wait for them to accept or decline.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_one_pending_offer ON public.offers;
CREATE TRIGGER check_one_pending_offer
  BEFORE INSERT OR UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_one_pending_offer_per_thread();
