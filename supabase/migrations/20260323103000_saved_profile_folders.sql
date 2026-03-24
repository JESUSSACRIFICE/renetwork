-- Saved profile folders for networking module

CREATE TABLE IF NOT EXISTS public.saved_profile_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_saved_profile_folders_user
  ON public.saved_profile_folders(user_id);

CREATE TABLE IF NOT EXISTS public.saved_folder_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid NOT NULL REFERENCES public.saved_profile_folders(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, folder_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_folder_profiles_user
  ON public.saved_folder_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_folder_profiles_folder
  ON public.saved_folder_profiles(folder_id);

ALTER TABLE public.saved_profile_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_folder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved profile folders"
  ON public.saved_profile_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved profile folders"
  ON public.saved_profile_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved profile folders"
  ON public.saved_profile_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved profile folders"
  ON public.saved_profile_folders
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own saved folder profiles"
  ON public.saved_folder_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved folder profiles"
  ON public.saved_folder_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved folder profiles"
  ON public.saved_folder_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_saved_profile_folders_updated_at ON public.saved_profile_folders;
CREATE TRIGGER set_saved_profile_folders_updated_at
  BEFORE UPDATE ON public.saved_profile_folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

