-- Add description to service packages (Fiverr-style package details)
ALTER TABLE public.service_packages
  ADD COLUMN IF NOT EXISTS description text;

-- Junction table: services can have multiple psp_types (categories)
CREATE TABLE IF NOT EXISTS public.service_psp_types (
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  psp_type_id uuid NOT NULL REFERENCES public.psp_types(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (service_id, psp_type_id)
);

CREATE INDEX IF NOT EXISTS idx_service_psp_types_service_id ON public.service_psp_types(service_id);
CREATE INDEX IF NOT EXISTS idx_service_psp_types_psp_type_id ON public.service_psp_types(psp_type_id);

ALTER TABLE public.service_psp_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service psp types are viewable by everyone"
  ON public.service_psp_types FOR SELECT
  USING (true);

CREATE POLICY "Providers can insert psp types for own services"
  ON public.service_psp_types FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete psp types for own services"
  ON public.service_psp_types FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

COMMENT ON TABLE public.service_psp_types IS 'Multiple categories (psp_types) per service';
