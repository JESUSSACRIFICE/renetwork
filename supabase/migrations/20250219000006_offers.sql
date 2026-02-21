-- Offers: service providers send offers in chat, clients can accept
-- sender_id = service_provider, recipient_id = client

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_sender ON public.offers(sender_id);
CREATE INDEX IF NOT EXISTS idx_offers_recipient ON public.offers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_offers_thread ON public.offers(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_offers_created ON public.offers(created_at);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Provider can insert (send) offers
CREATE POLICY "Providers can send offers"
  ON public.offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Both parties can view offers in their thread
CREATE POLICY "Thread participants can view offers"
  ON public.offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Only recipient (client) can update (accept/decline)
CREATE POLICY "Recipients can respond to offers"
  ON public.offers FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

COMMENT ON TABLE public.offers IS 'Offers sent by service providers in chat; clients can accept or decline';
