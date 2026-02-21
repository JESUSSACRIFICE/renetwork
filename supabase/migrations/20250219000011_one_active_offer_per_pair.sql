-- Only one active offer per customer-provider pair at a time
-- Block new offers if there's any active offer (pending, accepted, completion_requested) in either direction

CREATE OR REPLACE FUNCTION public.check_one_active_offer_per_pair()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    IF EXISTS (
      SELECT 1 FROM public.offers
      WHERE (
        (sender_id = NEW.sender_id AND recipient_id = NEW.recipient_id)
        OR (sender_id = NEW.recipient_id AND recipient_id = NEW.sender_id)
      )
        AND status IN ('pending', 'accepted', 'completion_requested')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'There is already an active offer between you and this customer. Wait for it to be completed, declined, or withdrawn.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_one_pending_offer ON public.offers;
CREATE TRIGGER check_one_active_offer_per_pair
  BEFORE INSERT OR UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_one_active_offer_per_pair();
