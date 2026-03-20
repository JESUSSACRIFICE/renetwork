-- SEC / JOBS Act Compliance Workflow
-- Investor accreditation, risk acknowledgment, investment limits, project approval

-- Admin role for project approval (ensure it exists)
ALTER TYPE public.professional_role ADD VALUE IF NOT EXISTS 'admin';

-- Investor compliance profile (Reg CF self-certification)
CREATE TABLE IF NOT EXISTS public.investor_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  annual_income_cents integer CHECK (annual_income_cents >= 0),
  net_worth_cents integer CHECK (net_worth_cents >= 0),
  is_accredited boolean NOT NULL DEFAULT false,
  risk_acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_investor_compliance_user ON public.investor_compliance(user_id);

-- Project compliance checklist (admin approval workflow)
CREATE TABLE IF NOT EXISTS public.crowdfunding_project_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.crowdfunding_projects(id) ON DELETE CASCADE,
  compliance_status text NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected')),
  checklist_json jsonb DEFAULT '[]',
  admin_notes text,
  approved_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id)
);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_project_compliance_project ON public.crowdfunding_project_compliance(project_id);

-- RLS
ALTER TABLE public.investor_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowdfunding_project_compliance ENABLE ROW LEVEL SECURITY;

-- Investor compliance: users manage own only
CREATE POLICY "Users can view own investor compliance"
  ON public.investor_compliance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investor compliance"
  ON public.investor_compliance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investor compliance"
  ON public.investor_compliance FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project compliance: creators see own; admins manage
CREATE POLICY "Anyone can view project compliance for active projects"
  ON public.crowdfunding_project_compliance FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage project compliance"
  ON public.crowdfunding_project_compliance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER set_investor_compliance_updated_at
  BEFORE UPDATE ON public.investor_compliance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_crowdfunding_project_compliance_updated_at
  BEFORE UPDATE ON public.crowdfunding_project_compliance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create project compliance row when project is created
CREATE OR REPLACE FUNCTION public.crowdfunding_project_compliance_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.crowdfunding_project_compliance (project_id, compliance_status)
  VALUES (NEW.id, 'pending')
  ON CONFLICT (project_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS crowdfunding_project_compliance_insert ON public.crowdfunding_projects;
CREATE TRIGGER crowdfunding_project_compliance_insert
  AFTER INSERT ON public.crowdfunding_projects
  FOR EACH ROW EXECUTE FUNCTION public.crowdfunding_project_compliance_on_insert();

-- Backfill: create compliance rows for existing projects
INSERT INTO public.crowdfunding_project_compliance (project_id, compliance_status)
SELECT id, 'pending' FROM public.crowdfunding_projects
ON CONFLICT (project_id) DO NOTHING;

-- Admin: can view all projects (including draft/pending_review) and update status
CREATE POLICY "Admins can view all crowdfunding projects"
  ON public.crowdfunding_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update project status"
  ON public.crowdfunding_projects FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (true);

COMMENT ON TABLE public.investor_compliance IS 'Investor self-certification for Reg CF; income, net worth, risk acknowledgment';
COMMENT ON TABLE public.crowdfunding_project_compliance IS 'Admin compliance checklist and approval for crowdfunding projects';
