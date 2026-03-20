-- Fiverr-style reviews: linked to completed offers, seller can respond
-- Only buyers who completed an order can leave a review

-- Add offer_id and seller_response to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS seller_response text;

-- One review per completed offer (when offer_id is set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_offer_id_unique
  ON public.reviews(offer_id)
  WHERE offer_id IS NOT NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_reviews_offer_id ON public.reviews(offer_id);

-- Drop old unique constraint if it exists (reviewer_id, profile_id) - we now allow multiple
-- reviews per reviewer+profile when linked to different offers
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_profile_id_key;

-- RLS: reviewer must be self; if offer_id provided, must be completed offer where user is buyer
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND (
      offer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.id = offer_id
          AND o.status = 'completed'
          AND o.recipient_id = auth.uid()
          AND o.sender_id = profile_id
      )
    )
  );

-- Seller (profile owner) can update seller_response only on their reviews
CREATE OR REPLACE FUNCTION public.reviews_seller_response_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If updating, only allow changing seller_response when user is the profile owner
  IF OLD.profile_id = auth.uid() THEN
    NEW.reviewer_id := OLD.reviewer_id;
    NEW.profile_id := OLD.profile_id;
    NEW.offer_id := OLD.offer_id;
    NEW.rating := OLD.rating;
    NEW.comment := OLD.comment;
    NEW.created_at := OLD.created_at;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_seller_response_trigger ON public.reviews;
CREATE TRIGGER reviews_seller_response_trigger
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.reviews_seller_response_check();

-- Policy: profile owner can update (for seller_response)
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR auth.uid() = profile_id)
  WITH CHECK (true);

COMMENT ON COLUMN public.reviews.offer_id IS 'Completed offer this review is for; Fiverr-style: only buyers of completed orders can review';
COMMENT ON COLUMN public.reviews.seller_response IS 'Provider response to the review, like Fiverr';
