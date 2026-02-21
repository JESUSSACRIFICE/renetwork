-- Offer completion flow: provider marks complete, customer accepts/rejects

ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS completion_requested_at timestamptz;

-- Add new statuses: completion_requested, completed
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE public.offers
  ADD CONSTRAINT offers_status_check
  CHECK (status IN (
    'pending', 'accepted', 'declined', 'withdrawn',
    'completion_requested', 'completed'
  ));
