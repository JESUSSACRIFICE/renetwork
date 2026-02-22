-- Networking Module: social feed, deal profiles, reputation
-- Connects users for deals, JV partnerships, and professional collaboration

-- Network posts (feed: posts, blogs, deal opportunities)
CREATE TABLE IF NOT EXISTS public.network_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'blog', 'deal')),
  deal_details jsonb DEFAULT '{}',
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_posts_author ON public.network_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_network_posts_type ON public.network_posts(type);
CREATE INDEX IF NOT EXISTS idx_network_posts_group ON public.network_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_network_posts_created ON public.network_posts(created_at DESC);

-- Post likes
CREATE TABLE IF NOT EXISTS public.network_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.network_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_network_post_likes_post ON public.network_post_likes(post_id);

-- Post comments
CREATE TABLE IF NOT EXISTS public.network_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.network_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_post_comments_post ON public.network_post_comments(post_id);

-- Deal-focused profile interests (what people want to buy/sell)
CREATE TABLE IF NOT EXISTS public.profile_deal_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_type text NOT NULL CHECK (interest_type IN ('buy', 'sell', 'jv', 'partner')),
  title text NOT NULL,
  description text,
  property_type text,
  location text,
  budget_min_cents integer,
  budget_max_cents integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_deal_interests_profile ON public.profile_deal_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_deal_interests_type ON public.profile_deal_interests(interest_type);

-- Reputation badges (extend profiles or separate)
CREATE TABLE IF NOT EXISTS public.profile_reputation_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  title text NOT NULL,
  description text,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_profile_reputation_badges_profile ON public.profile_reputation_badges(profile_id);

-- RLS
ALTER TABLE public.network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_deal_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reputation_badges ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read; auth users can create/update/delete own
CREATE POLICY "Anyone can view network posts"
  ON public.network_posts FOR SELECT USING (true);

CREATE POLICY "Auth users can create posts"
  ON public.network_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.network_posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.network_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Likes: read all; auth users manage own
CREATE POLICY "Anyone can view likes"
  ON public.network_post_likes FOR SELECT USING (true);

CREATE POLICY "Auth users can like"
  ON public.network_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.network_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: read all; auth users create; authors delete own
CREATE POLICY "Anyone can view comments"
  ON public.network_post_comments FOR SELECT USING (true);

CREATE POLICY "Auth users can comment"
  ON public.network_post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON public.network_post_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Deal interests: public read; profile owners manage
CREATE POLICY "Anyone can view deal interests"
  ON public.profile_deal_interests FOR SELECT USING (true);

CREATE POLICY "Profile owners can manage deal interests"
  ON public.profile_deal_interests FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Reputation badges: public read; system/admin would insert
CREATE POLICY "Anyone can view badges"
  ON public.profile_reputation_badges FOR SELECT USING (true);

CREATE POLICY "Profile owners can manage own badges"
  ON public.profile_reputation_badges FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Triggers
CREATE TRIGGER set_network_posts_updated_at
  BEFORE UPDATE ON public.network_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profile_deal_interests_updated_at
  BEFORE UPDATE ON public.profile_deal_interests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update like_count when likes change
CREATE OR REPLACE FUNCTION public.network_post_update_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'network_post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.network_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.network_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'network_post_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.network_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.network_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER network_post_likes_count
  AFTER INSERT OR DELETE ON public.network_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.network_post_update_counts();

CREATE TRIGGER network_post_comments_count
  AFTER INSERT OR DELETE ON public.network_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.network_post_update_counts();

COMMENT ON TABLE public.network_posts IS 'Social feed: posts, blogs, deal opportunities';
COMMENT ON TABLE public.profile_deal_interests IS 'What users want to buy/sell/JV';
COMMENT ON TABLE public.profile_reputation_badges IS 'Professional reputation badges';
