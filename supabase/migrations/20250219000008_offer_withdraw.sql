-- Allow service providers to withdraw (cancel) their pending offers

-- Add 'withdrawn' status
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE public.offers
  ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn'));

-- Providers can update (withdraw) their own sent offers
CREATE POLICY "Providers can withdraw own offers"
  ON public.offers FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
