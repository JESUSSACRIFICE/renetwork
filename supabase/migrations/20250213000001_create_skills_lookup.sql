-- Skills lookup table for professional skills/endorsements
-- Follows same pattern as psp_types

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_label ON public.skills(label);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

COMMENT ON TABLE public.skills IS 'Lookup table for professional skills';

-- Junction table: which skills does each user have
CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);

COMMENT ON TABLE public.user_skills IS 'Links users (profiles) to their skills';

-- RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_read_all"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "user_skills_read_all"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "user_skills_insert_own"
  ON public.user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_skills_delete_own"
  ON public.user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Seed skills
INSERT INTO public.skills (label, slug, category, sort_order) VALUES
  ('Property Valuation', 'property_valuation', 'general', 1),
  ('Market Analysis', 'market_analysis', 'general', 2),
  ('Contract Management', 'contract_management', 'general', 3),
  ('Staging', 'staging', 'general', 4),
  ('Open House', 'open_house', 'general', 5),
  ('Client Communication', 'client_communication', 'general', 6),
  ('Marketing and Advertising', 'marketing_and_advertising', 'general', 7),
  ('Negotiation', 'negotiation', 'general', 8),
  ('Luxury', 'luxury', 'new_developments', 9),
  ('Equestrian', 'equestrian', 'new_developments', 10),
  ('MIXED USE', 'mixed_use', 'new_developments', 11),
  ('Water-Front', 'water_front', 'new_developments', 12),
  ('HILL''S, MOUNTAIN''S', 'hills_mountains', 'new_developments', 13),
  ('Acreage', 'acreage', 'new_developments', 14),
  ('Elderly Senior''s', 'elderly_seniors', 'new_developments', 15),
  ('Closing Coordination', 'closing_coordination', 'general', 16)
ON CONFLICT (label) DO NOTHING;

-- Seed user_skills for user 4cd13731-ace7-4db6-970b-a0730bf8f1b0 (only if user exists)
INSERT INTO public.user_skills (user_id, skill_id)
SELECT
  '4cd13731-ace7-4db6-970b-a0730bf8f1b0'::uuid,
  s.id
FROM public.skills s
WHERE s.label IN ('Property Valuation', 'Market Analysis', 'Contract Management')
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = '4cd13731-ace7-4db6-970b-a0730bf8f1b0'::uuid)
ON CONFLICT (user_id, skill_id) DO NOTHING;
