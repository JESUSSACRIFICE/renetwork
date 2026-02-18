-- Remove label column from user_psp_types (labels come from psp_types via join)

DROP TRIGGER IF EXISTS trg_sync_user_psp_types_label ON public.user_psp_types;
DROP FUNCTION IF EXISTS public.sync_user_psp_types_label();

DROP INDEX IF EXISTS idx_user_psp_types_label;

ALTER TABLE public.user_psp_types
  DROP COLUMN IF EXISTS label;
