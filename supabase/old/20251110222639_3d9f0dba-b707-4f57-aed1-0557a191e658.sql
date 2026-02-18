-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups/community table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  owner_id UUID NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'public',
  member_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hot topics table
CREATE TABLE public.hot_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create awards table
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  recipient_id UUID,
  description TEXT,
  date_awarded TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsors
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sponsors"
  ON public.sponsors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- RLS Policies for groups
CREATE POLICY "Public groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (privacy = 'public' OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for group members
CREATE POLICY "Group members are viewable by everyone"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum posts
CREATE POLICY "Posts in public groups are viewable by everyone"
  ON public.forum_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.groups WHERE groups.id = forum_posts.group_id AND groups.privacy = 'public'
  ) OR auth.uid() = author_id OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = forum_posts.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = forum_posts.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Post authors can update their posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Post authors can delete their posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for forum replies
CREATE POLICY "Replies are viewable like their posts"
  ON public.forum_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forum_posts 
    JOIN public.groups ON groups.id = forum_posts.group_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND (groups.privacy = 'public' OR EXISTS (
      SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()
    ))
  ));

CREATE POLICY "Group members can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Reply authors can update their replies"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Reply authors can delete their replies"
  ON public.forum_replies FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for hot topics
CREATE POLICY "Hot topics are viewable by everyone"
  ON public.hot_topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hot topics"
  ON public.hot_topics FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- RLS Policies for awards
CREATE POLICY "Awards are viewable by everyone"
  ON public.awards FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage awards"
  ON public.awards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();