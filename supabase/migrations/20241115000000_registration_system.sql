-- Registration System Migration
-- Extends profiles and adds registration-specific tables

-- Extend profiles table with additional fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS mailing_address TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS business_hours TEXT,
  ADD COLUMN IF NOT EXISTS best_times_to_reach TEXT,
  ADD COLUMN IF NOT EXISTS number_of_employees INTEGER,
  ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('service_provider', 'business_buyer')),
  ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'under_review', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS interview_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier_package TEXT CHECK (tier_package IN ('basic', 'standard', 'advanced')),
  ADD COLUMN IF NOT EXISTS tools_technologies TEXT[],
  ADD COLUMN IF NOT EXISTS service_radius INTEGER;

-- Create identity_documents table
CREATE TABLE IF NOT EXISTS public.identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'state_id', 'national_id', 'passport', etc.
  country TEXT NOT NULL,
  state TEXT,
  number TEXT NOT NULL,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create licenses_credentials table
CREATE TABLE IF NOT EXISTS public.licenses_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'license', 'credential', 'certificate'
  country TEXT NOT NULL,
  state TEXT,
  number TEXT NOT NULL,
  active_since DATE,
  renewal_date DATE,
  expiration_date DATE,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bonds_insurance table
CREATE TABLE IF NOT EXISTS public.bonds_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'bond', 'insurance_eo', 'insurance_liability', 'policy'
  description TEXT,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create e_signatures table
CREATE TABLE IF NOT EXISTS public.e_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'terms_of_service', 'privacy_policy', 'no_recruit', 'non_compete'
  signature_data TEXT NOT NULL, -- Base64 signature image
  name_printed TEXT NOT NULL,
  name_signed TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, document_type)
);

-- Create preference_rankings table (for PSP)
CREATE TABLE IF NOT EXISTS public.preference_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'stamper', 'professional', 'agent', 'mortgage', 'trade'
  ranking INTEGER NOT NULL CHECK (ranking >= 1 AND ranking <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Create buyer_preferences table
CREATE TABLE IF NOT EXISTS public.buyer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_type TEXT, -- 'commercial', 'residential', 'mixed', etc.
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  preferred_payment_method TEXT, -- 'cash', 'credit', 'financing'
  timeline_to_purchase TEXT,
  business_industry TEXT,
  languages_spoken TEXT[],
  specific_requirements TEXT,
  purchase_documents_urls TEXT[],
  truth_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create buyer_basic_info table
CREATE TABLE IF NOT EXISTS public.buyer_basic_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location_zip_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create demography_maintenance_plans table (for buyers)
CREATE TABLE IF NOT EXISTS public.demography_maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_packet TEXT CHECK (payment_packet IN ('weekly', 'bi-weekly', 'monthly', 'yearly')),
  tier_package TEXT CHECK (tier_package IN ('basic', 'standard', 'advanced')),
  payment_methods TEXT[] CHECK (array_length(payment_methods, 1) > 0),
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create onboarding_steps table
CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL, -- 'first_service_post', 'profile_completion', 'agency_setup', 'refer_someone'
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  data JSONB, -- Store step-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step_name)
);

-- Enable RLS
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonds_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preference_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demography_maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for identity_documents
CREATE POLICY "Users can view own identity documents"
  ON public.identity_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identity documents"
  ON public.identity_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identity documents"
  ON public.identity_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for licenses_credentials
CREATE POLICY "Users can view own licenses"
  ON public.licenses_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own licenses"
  ON public.licenses_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own licenses"
  ON public.licenses_credentials FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for bonds_insurance
CREATE POLICY "Users can view own bonds insurance"
  ON public.bonds_insurance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bonds insurance"
  ON public.bonds_insurance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bonds insurance"
  ON public.bonds_insurance FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for e_signatures
CREATE POLICY "Users can view own e-signatures"
  ON public.e_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own e-signatures"
  ON public.e_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for preference_rankings
CREATE POLICY "Users can view own rankings"
  ON public.preference_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own rankings"
  ON public.preference_rankings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for buyer_preferences
CREATE POLICY "Users can view own buyer preferences"
  ON public.buyer_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own buyer preferences"
  ON public.buyer_preferences FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for buyer_basic_info
CREATE POLICY "Users can view own buyer info"
  ON public.buyer_basic_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own buyer info"
  ON public.buyer_basic_info FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for demography_maintenance_plans
CREATE POLICY "Users can view own maintenance plans"
  ON public.demography_maintenance_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own maintenance plans"
  ON public.demography_maintenance_plans FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for onboarding_steps
CREATE POLICY "Users can view own onboarding steps"
  ON public.onboarding_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own onboarding steps"
  ON public.onboarding_steps FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update updated_at for preference_rankings
CREATE TRIGGER set_preference_rankings_updated_at
  BEFORE UPDATE ON public.preference_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update updated_at for buyer_preferences
CREATE TRIGGER set_buyer_preferences_updated_at
  BEFORE UPDATE ON public.buyer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update updated_at for onboarding_steps
CREATE TRIGGER set_onboarding_steps_updated_at
  BEFORE UPDATE ON public.onboarding_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();




