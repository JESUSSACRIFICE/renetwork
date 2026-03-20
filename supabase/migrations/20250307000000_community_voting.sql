-- Community-Driven Voting: Vote on locations and features to build
-- Users vote on what gets built next

-- Items users can vote on (locations, features)
CREATE TABLE IF NOT EXISTS public.community_vote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  item_type text NOT NULL CHECK (item_type IN ('location', 'feature')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'planned', 'built')),
  vote_count integer NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_vote_items_type ON public.community_vote_items(item_type);
CREATE INDEX IF NOT EXISTS idx_community_vote_items_status ON public.community_vote_items(status);
CREATE INDEX IF NOT EXISTS idx_community_vote_items_votes ON public.community_vote_items(vote_count DESC);

-- User votes on items
CREATE TABLE IF NOT EXISTS public.community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.community_vote_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_votes_item ON public.community_votes(item_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_user ON public.community_votes(user_id);

-- RLS
ALTER TABLE public.community_vote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- Vote items: public read
CREATE POLICY "Anyone can view vote items"
  ON public.community_vote_items FOR SELECT
  USING (true);

-- Admins can manage items (creator_id or role check - using auth for now, can add admin role later)
CREATE POLICY "Authenticated users can insert vote items"
  ON public.community_vote_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vote items"
  ON public.community_vote_items FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Votes: public read counts; users manage own votes
CREATE POLICY "Anyone can view votes"
  ON public.community_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON public.community_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update vote_count on community_vote_items
CREATE OR REPLACE FUNCTION public.community_vote_count_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_vote_items
    SET vote_count = vote_count + 1, updated_at = now()
    WHERE id = NEW.item_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_vote_items
    SET vote_count = GREATEST(0, vote_count - 1), updated_at = now()
    WHERE id = OLD.item_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER community_votes_count_trigger
  AFTER INSERT OR DELETE ON public.community_votes
  FOR EACH ROW EXECUTE FUNCTION public.community_vote_count_sync();

-- Updated_at trigger
CREATE TRIGGER set_community_vote_items_updated_at
  BEFORE UPDATE ON public.community_vote_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.community_vote_items IS 'Community vote items: locations and features to vote on';
COMMENT ON TABLE public.community_votes IS 'User votes on community vote items';
