-- Networking social graph + comment notifications

-- 1) Follow / friend relationships
-- "Following": A follows B
-- "Friend": mutual follow (A follows B AND B follows A)
CREATE TABLE IF NOT EXISTS public.profile_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_follows_follower ON public.profile_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_profile_follows_following ON public.profile_follows(following_id);

ALTER TABLE public.profile_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.profile_follows
  FOR SELECT USING (true);

CREATE POLICY "Auth users can follow" ON public.profile_follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Auth users can unfollow" ON public.profile_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- 2) Notify post author on new comments
-- Inserts into the central `user_notifications` hub using type = 'general'
-- (so we don't need to expand the notification type check constraint).
CREATE OR REPLACE FUNCTION public.notify_network_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  -- Find the post owner.
  SELECT author_id INTO post_author_id
  FROM public.network_posts
  WHERE id = NEW.post_id;

  -- If for any reason we can't resolve it, skip.
  IF post_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- "Someone else" only; never notify the commenter about their own comment.
  IF post_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;

  INSERT INTO public.user_notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    entity_type,
    entity_id,
    read_at
  )
  VALUES (
    post_author_id,
    'general',
    'New comment on your post',
    commenter_name || ' commented on your post.',
    '/network/posts/' || NEW.post_id,
    'network_post_comment',
    NEW.id,
    NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_network_post_comment ON public.network_post_comments;
CREATE TRIGGER trigger_notify_network_post_comment
  AFTER INSERT ON public.network_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_network_post_comment();

