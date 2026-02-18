-- PSP (Professional Service Provider) types lookup table
-- Canonical list of professional roles for filtering and display

CREATE TABLE IF NOT EXISTS public.psp_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_psp_types_slug ON public.psp_types(slug);
CREATE INDEX IF NOT EXISTS idx_psp_types_label ON public.psp_types(label);

COMMENT ON TABLE public.psp_types IS 'Lookup table for professional service provider types (A-Z PSP options)';

-- Junction table: which PSP types does each user have
CREATE TABLE IF NOT EXISTS public.user_psp_types (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  psp_type_id uuid NOT NULL REFERENCES public.psp_types(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, psp_type_id)
);

CREATE INDEX IF NOT EXISTS idx_user_psp_types_user_id ON public.user_psp_types(user_id);
CREATE INDEX IF NOT EXISTS idx_user_psp_types_psp_type_id ON public.user_psp_types(psp_type_id);

COMMENT ON TABLE public.user_psp_types IS 'Links users (profiles) to their professional service provider types';

-- RLS
ALTER TABLE public.psp_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_psp_types ENABLE ROW LEVEL SECURITY;

-- psp_types: anyone can read
CREATE POLICY "psp_types_read_all"
  ON public.psp_types FOR SELECT
  USING (true);

-- user_psp_types: anyone can read (for browse/search)
CREATE POLICY "user_psp_types_read_all"
  ON public.user_psp_types FOR SELECT
  USING (true);

-- Users can manage their own PSP types
CREATE POLICY "user_psp_types_insert_own"
  ON public.user_psp_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_psp_types_delete_own"
  ON public.user_psp_types FOR DELETE
  USING (auth.uid() = user_id);

-- Seed psp_types with all options from SearchForm (A-Z)
INSERT INTO public.psp_types (label, slug, sort_order) VALUES
  ('Accountant', 'accountant', 1),
  ('Agent', 'agent', 2),
  ('Appraiser', 'appraiser', 3),
  ('Architect', 'architect', 4),
  ('Asbesto''s', 'asbestos', 5),
  ('Attorney''s', 'attorneys', 6),
  ('RE Attorney''s', 're_attorneys', 7),
  ('Worker''s Comp', 'workers_comp', 8),
  ('Bookkeeper', 'bookkeeper', 9),
  ('Broker', 'broker', 10),
  ('Builder', 'builder', 11),
  ('Cleaner', 'cleaner', 12),
  ('Concrete', 'concrete', 13),
  ('Contractor', 'contractor', 14),
  ('Construction', 'construction', 15),
  ('Consultant', 'consultant', 16),
  ('Consultant''s', 'consultants', 17),
  ('Crowdfunding', 'crowdfunding', 18),
  ('Developer', 'developer', 19),
  ('Electrician', 'electrician', 20),
  ('Escrow', 'escrow', 21),
  ('Flooring', 'flooring', 22),
  ('Framer', 'framer', 23),
  ('Gardening', 'gardening', 24),
  ('HVAC', 'hvac', 25),
  ('Investor', 'investor', 26),
  ('Janitorial', 'janitorial', 27),
  ('Landscaper', 'landscaper', 28),
  ('Loan', 'loan', 29),
  ('Loan Executive', 'loan_executive', 30),
  ('Loan Originator', 'loan_originator', 31),
  ('Loan Processor', 'loan_processor', 32),
  ('Mortgage', 'mortgage', 33),
  ('Mover''s', 'movers', 34),
  ('Painter', 'painter', 35),
  ('Pavement', 'pavement', 36),
  ('Pest', 'pest', 37),
  ('Professional''s', 'professionals', 38),
  ('Plumber', 'plumber', 39),
  ('Pool', 'pool', 40),
  ('Pressure Washer', 'pressure_washer', 41),
  ('Real Estate', 'real_estate', 42),
  ('Roofing', 'roofing', 43),
  ('Sand-Blasting', 'sand_blasting', 44),
  ('Solar', 'solar', 45),
  ('Squat-Removal', 'squat_removal', 46),
  ('Taxes', 'taxes', 47),
  ('Transaction Coordinator', 'transaction_coordinator', 48),
  ('Trash Bin Cleaner', 'trash_bin_cleaner', 49),
  ('Wholesaler', 'wholesaler', 50),
  ('Welder', 'welder', 51),
  ('Window Cleaner', 'window_cleaner', 52)
ON CONFLICT (label) DO NOTHING;
