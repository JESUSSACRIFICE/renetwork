-- Add service_fields for SearchForm "Fields" filter (Commercial, Residential, etc.)
-- Enables filtering services by property/real estate field type

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS service_fields text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_services_service_fields ON public.services USING GIN (service_fields);

COMMENT ON COLUMN public.services.service_fields IS 'Property types this service applies to (e.g. Commercial, Residential, Multi-Unit)';
