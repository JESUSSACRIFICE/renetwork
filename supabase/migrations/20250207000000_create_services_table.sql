-- Services table: offerings by service providers (PSPs)
-- Each row is a sellable service linked to a profile (provider).

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  description text,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  image_url text,
  delivery_days integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for listing services by provider and for search
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON public.services(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_services_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_services_updated_at();

-- RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone can read services (public browse)
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

-- Only the provider can insert their own services
CREATE POLICY "Providers can insert own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

-- Only the provider can update their own services
CREATE POLICY "Providers can update own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = provider_id);

-- Only the provider can delete their own services
CREATE POLICY "Providers can delete own services"
  ON public.services FOR DELETE
  USING (auth.uid() = provider_id);

COMMENT ON TABLE public.services IS 'Service offerings (gigs) by property service providers';
