-- Add birthday and mailing_address to profiles for registration step 2
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS mailing_address TEXT;

