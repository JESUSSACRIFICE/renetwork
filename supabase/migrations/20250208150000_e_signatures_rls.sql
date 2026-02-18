-- RLS for e_signatures: users can only manage their own rows
ALTER TABLE public.e_signatures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (so this migration is idempotent)
DROP POLICY IF EXISTS "Users can select own e_signatures" ON public.e_signatures;
DROP POLICY IF EXISTS "Users can insert own e_signatures" ON public.e_signatures;
DROP POLICY IF EXISTS "Users can update own e_signatures" ON public.e_signatures;
DROP POLICY IF EXISTS "Users can delete own e_signatures" ON public.e_signatures;

-- Allow users to select their own e-signatures
CREATE POLICY "Users can select own e_signatures"
  ON public.e_signatures FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own e-signatures
CREATE POLICY "Users can insert own e_signatures"
  ON public.e_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own e-signatures
CREATE POLICY "Users can update own e_signatures"
  ON public.e_signatures FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own e-signatures
CREATE POLICY "Users can delete own e_signatures"
  ON public.e_signatures FOR DELETE
  USING (auth.uid() = user_id);
