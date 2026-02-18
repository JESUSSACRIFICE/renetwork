-- Add customer, professional service provider, and investor to user_roles (professional_role enum)
ALTER TYPE public.professional_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE public.professional_role ADD VALUE IF NOT EXISTS 'professional_service_provider';
ALTER TYPE public.professional_role ADD VALUE IF NOT EXISTS 'investor';
