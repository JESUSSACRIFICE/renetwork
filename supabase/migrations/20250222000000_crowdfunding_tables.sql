-- Crowdfunding Module: faith-based real estate and entertainment projects
-- JOBS Act–minded design; SEC pre-approval required before live investments

-- Projects: listings with images, descriptions, funding goals
CREATE TABLE IF NOT EXISTS public.crowdfunding_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE,
  short_description text,
  description text,
  images text[] DEFAULT '{}',
  category text CHECK (category IN ('real_estate', 'entertainment', 'recreation', 'other')),
  location text,
  min_investment_cents integer NOT NULL CHECK (min_investment_cents >= 0),
  target_amount_cents integer NOT NULL CHECK (target_amount_cents > 0),
  raised_amount_cents integer NOT NULL DEFAULT 0 CHECK (raised_amount_cents >= 0),
  expected_roi_pct numeric(5,2),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'funded', 'closed', 'cancelled')),
  fund_allocation_json jsonb DEFAULT '[]',
  deadline_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_status ON public.crowdfunding_projects(status);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_creator ON public.crowdfunding_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_created ON public.crowdfunding_projects(created_at DESC);

-- Fund allocation breakdown (transparent allocation)
CREATE TABLE IF NOT EXISTS public.crowdfunding_fund_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.crowdfunding_projects(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  amount_pct numeric(5,2) NOT NULL CHECK (amount_pct >= 0 AND amount_pct <= 100),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_allocations_project ON public.crowdfunding_fund_allocations(project_id);

-- Pledges: user investments (interest/pre-commit until SEC approval)
CREATE TABLE IF NOT EXISTS public.crowdfunding_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.crowdfunding_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'confirmed', 'cancelled', 'refunded')),
  return_amount_cents integer,
  return_paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_project ON public.crowdfunding_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_user ON public.crowdfunding_pledges(user_id);

-- Community votes on projects
CREATE TABLE IF NOT EXISTS public.crowdfunding_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.crowdfunding_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down', 'interested')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_votes_project ON public.crowdfunding_votes(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_votes_user ON public.crowdfunding_votes(user_id);

-- Notifications for crowdfunding (returns, project updates, etc.)
CREATE TABLE IF NOT EXISTS public.crowdfunding_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.crowdfunding_projects(id) ON DELETE SET NULL,
  pledge_id uuid REFERENCES public.crowdfunding_pledges(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('project_update', 'funding_milestone', 'return_paid', 'project_funded', 'project_closed')),
  title text NOT NULL,
  message text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_notifications_user ON public.crowdfunding_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_notifications_read ON public.crowdfunding_notifications(user_id, read_at);

-- RLS
ALTER TABLE public.crowdfunding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowdfunding_fund_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowdfunding_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowdfunding_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowdfunding_notifications ENABLE ROW LEVEL SECURITY;

-- Projects: public read for active/funded/closed; creators can manage their own
CREATE POLICY "Anyone can view active projects"
  ON public.crowdfunding_projects FOR SELECT
  USING (status IN ('active', 'funded', 'closed'));

CREATE POLICY "Creators can manage own projects"
  ON public.crowdfunding_projects FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Allocations: public read for project allocations
CREATE POLICY "Anyone can view fund allocations"
  ON public.crowdfunding_fund_allocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crowdfunding_projects p
      WHERE p.id = project_id AND p.status IN ('active', 'funded', 'closed')
    )
  );

CREATE POLICY "Creators can manage project allocations"
  ON public.crowdfunding_fund_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.crowdfunding_projects p
      WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crowdfunding_projects p
      WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
  );

-- Pledges: users see own; project creators see project pledges
CREATE POLICY "Users can view own pledges"
  ON public.crowdfunding_pledges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can view project pledges"
  ON public.crowdfunding_pledges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crowdfunding_projects p
      WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pledges"
  ON public.crowdfunding_pledges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pledges (cancel)"
  ON public.crowdfunding_pledges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Votes: public read counts; users manage own votes
CREATE POLICY "Anyone can view votes"
  ON public.crowdfunding_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON public.crowdfunding_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications: users see own only
CREATE POLICY "Users can view own notifications"
  ON public.crowdfunding_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.crowdfunding_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER set_crowdfunding_projects_updated_at
  BEFORE UPDATE ON public.crowdfunding_projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_crowdfunding_pledges_updated_at
  BEFORE UPDATE ON public.crowdfunding_pledges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update raised_amount when pledge is confirmed
CREATE OR REPLACE FUNCTION public.crowdfunding_update_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.crowdfunding_projects
    SET raised_amount_cents = raised_amount_cents + NEW.amount_cents
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> 'confirmed' AND NEW.status = 'confirmed' THEN
    UPDATE public.crowdfunding_projects
    SET raised_amount_cents = raised_amount_cents + NEW.amount_cents
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status <> 'confirmed' THEN
    UPDATE public.crowdfunding_projects
    SET raised_amount_cents = raised_amount_cents - OLD.amount_cents
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crowdfunding_pledge_raised_trigger
  AFTER INSERT OR UPDATE ON public.crowdfunding_pledges
  FOR EACH ROW EXECUTE FUNCTION public.crowdfunding_update_raised();

-- Create notification when user pledges
CREATE OR REPLACE FUNCTION public.crowdfunding_notify_pledge()
RETURNS TRIGGER AS $$
DECLARE
  proj_title text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pledged' THEN
    SELECT title INTO proj_title FROM public.crowdfunding_projects WHERE id = NEW.project_id;
    INSERT INTO public.crowdfunding_notifications (user_id, project_id, pledge_id, type, title, message)
    VALUES (
      NEW.user_id,
      NEW.project_id,
      NEW.id,
      'project_update',
      'Pledge recorded',
      'Your interest pledge for ' || COALESCE(proj_title, 'project') || ' has been recorded. Interest only until SEC approval.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crowdfunding_pledge_notify
  AFTER INSERT ON public.crowdfunding_pledges
  FOR EACH ROW EXECUTE FUNCTION public.crowdfunding_notify_pledge();

COMMENT ON TABLE public.crowdfunding_projects IS 'Faith-based crowdfunding projects; JOBS Act–minded, SEC pre-approval required';
COMMENT ON TABLE public.crowdfunding_pledges IS 'User pledges/investments; interest-only until SEC approval';
COMMENT ON TABLE public.crowdfunding_votes IS 'Community voting on projects';
COMMENT ON TABLE public.crowdfunding_fund_allocations IS 'Transparent fund allocation breakdown per project';
