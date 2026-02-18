-- 1. Add UPDATE policy for user_psp_types (some clients use upsert)
CREATE POLICY "user_psp_types_update_own"
  ON public.user_psp_types FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Seed user_psp_types for profiles that have none (so data appears in the table)
-- Assigns "Agent" to the first 15 profiles that don't have any PSP types yet
INSERT INTO public.user_psp_types (user_id, psp_type_id)
SELECT p.id, pt.id
FROM (SELECT id FROM public.profiles ORDER BY id LIMIT 15) p
JOIN public.psp_types pt ON pt.label = 'Agent'
WHERE NOT EXISTS (SELECT 1 FROM public.user_psp_types u WHERE u.user_id = p.id)
ON CONFLICT (user_id, psp_type_id) DO NOTHING;
