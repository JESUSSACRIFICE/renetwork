-- Service packages: multiple pricing tiers per service (e.g. Basic, Standard, Premium)
-- Each package has its own price and delivery time.

CREATE TABLE IF NOT EXISTS public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title text NOT NULL,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  delivery_days integer NOT NULL DEFAULT 3,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages(service_id);

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can read packages (public browse)
CREATE POLICY "Service packages are viewable by everyone"
  ON public.service_packages FOR SELECT
  USING (true);

-- Only the service provider can insert packages for their services
CREATE POLICY "Providers can insert packages for own services"
  ON public.service_packages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- Only the service provider can update packages for their services
CREATE POLICY "Providers can update packages for own services"
  ON public.service_packages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- Only the service provider can delete packages for their services
CREATE POLICY "Providers can delete packages for own services"
  ON public.service_packages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

COMMENT ON TABLE public.service_packages IS 'Pricing packages (tiers) for services';
