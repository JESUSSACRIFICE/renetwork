-- Create enum for professional roles
CREATE TYPE public.professional_role AS ENUM (
  'real_estate_agent',
  'mortgage_consultant', 
  'real_estate_attorney',
  'escrow_officer',
  'property_inspector',
  'appraiser',
  'title_officer',
  'general_contractor',
  'electrician',
  'plumber',
  'hvac_technician',
  'roofer',
  'landscaper'
);

-- Create enum for experience level
CREATE TYPE public.experience_level AS ENUM (
  'expert',
  'mature',
  'seasonal',
  'new'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  website TEXT,
  license_number TEXT,
  company_name TEXT,
  experience_level experience_level DEFAULT 'new',
  years_of_experience INTEGER,
  referral_fee_percentage INTEGER CHECK (referral_fee_percentage >= 0 AND referral_fee_percentage <= 100),
  hourly_rate DECIMAL(10,2),
  price_per_sqft DECIMAL(10,2),
  willing_to_train BOOLEAN DEFAULT false,
  training_details TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role professional_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create service_areas table
CREATE TABLE public.service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zip_code TEXT NOT NULL,
  radius_miles INTEGER NOT NULL DEFAULT 25,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_preferences table
CREATE TABLE public.payment_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  accepts_cash BOOLEAN DEFAULT true,
  accepts_credit BOOLEAN DEFAULT true,
  accepts_financing BOOLEAN DEFAULT false,
  payment_packet TEXT, -- 'weekly', 'bi-weekly', 'monthly', 'yearly'
  payment_terms TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roles"
  ON public.user_roles FOR DELETE
  USING (auth.uid() = user_id);

-- Service areas policies
CREATE POLICY "Service areas are viewable by everyone"
  ON public.service_areas FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own service areas"
  ON public.service_areas FOR ALL
  USING (auth.uid() = user_id);

-- Payment preferences policies
CREATE POLICY "Payment preferences are viewable by everyone"
  ON public.payment_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own payment preferences"
  ON public.payment_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role professional_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;