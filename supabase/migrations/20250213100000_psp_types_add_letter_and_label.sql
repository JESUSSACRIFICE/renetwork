-- Add letter column to psp_types for A-Z grouping (matches PSP_OPTIONS_BY_LETTER)
ALTER TABLE public.psp_types
  ADD COLUMN IF NOT EXISTS letter text;

-- Add label column to user_psp_types for convenience (denormalized from psp_types)
ALTER TABLE public.user_psp_types
  ADD COLUMN IF NOT EXISTS label text;

-- Trigger to auto-populate label in user_psp_types from psp_types on insert
CREATE OR REPLACE FUNCTION public.sync_user_psp_types_label()
RETURNS TRIGGER AS $$
BEGIN
  SELECT pt.label INTO NEW.label
  FROM public.psp_types pt
  WHERE pt.id = NEW.psp_type_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_psp_types_label ON public.user_psp_types;
CREATE TRIGGER trg_sync_user_psp_types_label
  BEFORE INSERT ON public.user_psp_types
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_psp_types_label();

-- Backfill letter on existing psp_types and backfill label on user_psp_types
UPDATE public.psp_types SET letter = 'A' WHERE label IN ('Accountant','Agent','Appraiser','Architect','Asbesto''s','Attorney''s','RE Attorney''s','Worker''s Comp');
UPDATE public.psp_types SET letter = 'B' WHERE label IN ('Bookkeeper','Broker','Builder');
UPDATE public.psp_types SET letter = 'C' WHERE label IN ('Cleaner','Concrete','Contractor','Construction','Consultant','Consultant''s','Crowdfunding');
UPDATE public.psp_types SET letter = 'D' WHERE label = 'Developer';
UPDATE public.psp_types SET letter = 'E' WHERE label IN ('Electrician','Escrow');
UPDATE public.psp_types SET letter = 'F' WHERE label IN ('Flooring','Framer');
UPDATE public.psp_types SET letter = 'G' WHERE label = 'Gardening';
UPDATE public.psp_types SET letter = 'H' WHERE label = 'HVAC';
UPDATE public.psp_types SET letter = 'I' WHERE label = 'Investor';
UPDATE public.psp_types SET letter = 'J' WHERE label = 'Janitorial';
UPDATE public.psp_types SET letter = 'L' WHERE label IN ('Landscaper','Loan','Loan Executive','Loan Originator','Loan Processor');
UPDATE public.psp_types SET letter = 'M' WHERE label IN ('Mortgage','Mover''s');
UPDATE public.psp_types SET letter = 'P' WHERE label IN ('Painter','Pavement','Pest','Professional''s','Plumber','Pool','Pressure Washer');
UPDATE public.psp_types SET letter = 'R' WHERE label IN ('Real Estate','Roofing');
UPDATE public.psp_types SET letter = 'S' WHERE label IN ('Sand-Blasting','Solar','Squat-Removal');
UPDATE public.psp_types SET letter = 'T' WHERE label IN ('Taxes','Transaction Coordinator','Trash Bin Cleaner');
UPDATE public.psp_types SET letter = 'W' WHERE label IN ('Wholesaler','Welder','Window Cleaner');

-- Backfill label in user_psp_types from psp_types
UPDATE public.user_psp_types upt
SET label = pt.label
FROM public.psp_types pt
WHERE upt.psp_type_id = pt.id AND (upt.label IS NULL OR upt.label != pt.label);

CREATE INDEX IF NOT EXISTS idx_psp_types_letter ON public.psp_types(letter);
CREATE INDEX IF NOT EXISTS idx_user_psp_types_label ON public.user_psp_types(label);
