# Step-by-Step Guide: Running Supabase Migrations

This guide will help you run all the database migrations to create the required tables in your Supabase database.

## Method 1: Using Supabase Dashboard (Recommended - Easiest)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **gqfrsptqctkxbrttyrxc**

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** button (top right)

### Step 3: Run Migrations in Order

You need to run the migrations in chronological order. Copy and paste each SQL script below into the SQL Editor and click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).

---

## Migration 1: Create Base Tables and Enums

**Copy this entire code block and run it:**

```sql
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
```

**✅ After running, you should see "Success. No rows returned"**

---

## Migration 2: Registration System Tables

**Copy this entire code block and run it:**

```sql
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
```

**✅ After running, you should see "Success. No rows returned"**

---

## Migration 3: Leads and Messaging Tables

**Copy this entire code block and run it:**

```sql
-- Create leads table for contact inquiries
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table for direct messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Create saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_params JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Professionals can view their own leads"
  ON public.leads FOR SELECT
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE id = (SELECT id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can view their own submitted leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Professionals can update their leads"
  ON public.leads FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE id = (SELECT id FROM public.profiles WHERE id = auth.uid()))
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for saved searches
CREATE POLICY "Users can view own searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own searches"
  ON public.saved_searches FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Create indexes for performance
CREATE INDEX idx_leads_profile_id ON public.leads(profile_id);
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_profile_id ON public.favorites(profile_id);
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX idx_reviews_profile_id ON public.reviews(profile_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- Add updated_at trigger for leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**✅ After running, you should see "Success. No rows returned"**

---

## Migration 4: Add Admin Role

**Copy this entire code block and run it:**

```sql
-- Add admin role to existing enum
ALTER TYPE professional_role ADD VALUE IF NOT EXISTS 'admin';
```

**✅ After running, you should see "Success. No rows returned"**

---

## Migration 5: Community/Forum Tables

**Copy this entire code block and run it:**

```sql
-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups/community table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  owner_id UUID NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'public',
  member_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hot topics table
CREATE TABLE public.hot_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create awards table
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  recipient_id UUID,
  description TEXT,
  date_awarded TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsors
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sponsors"
  ON public.sponsors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- RLS Policies for groups
CREATE POLICY "Public groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (privacy = 'public' OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for group members
CREATE POLICY "Group members are viewable by everyone"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum posts
CREATE POLICY "Posts in public groups are viewable by everyone"
  ON public.forum_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.groups WHERE groups.id = forum_posts.group_id AND groups.privacy = 'public'
  ) OR auth.uid() = author_id OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = forum_posts.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = forum_posts.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Post authors can update their posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Post authors can delete their posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for forum replies
CREATE POLICY "Replies are viewable like their posts"
  ON public.forum_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forum_posts 
    JOIN public.groups ON groups.id = forum_posts.group_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND (groups.privacy = 'public' OR EXISTS (
      SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()
    ))
  ));

CREATE POLICY "Group members can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Reply authors can update their replies"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Reply authors can delete their replies"
  ON public.forum_replies FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for hot topics
CREATE POLICY "Hot topics are viewable by everyone"
  ON public.hot_topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hot topics"
  ON public.hot_topics FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- RLS Policies for awards
CREATE POLICY "Awards are viewable by everyone"
  ON public.awards FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage awards"
  ON public.awards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::professional_role));

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**✅ After running, you should see "Success. No rows returned"**

---

## Step 4: Verify the Migration

1. Go to **"Table Editor"** in the left sidebar
2. You should now see all these tables:
   - `profiles` ✅
   - `user_roles` ✅
   - `service_areas` ✅
   - `payment_preferences` ✅
   - `identity_documents` ✅
   - `licenses_credentials` ✅
   - `bonds_insurance` ✅
   - `e_signatures` ✅
   - `preference_rankings` ✅
   - `buyer_preferences` ✅
   - `buyer_basic_info` ✅
   - `demography_maintenance_plans` ✅
   - `onboarding_steps` ✅
   - `leads` ✅
   - `messages` ✅
   - `favorites` ✅
   - `saved_searches` ✅
   - `reviews` ✅
   - `sponsors` ✅
   - `groups` ✅
   - `group_members` ✅
   - `forum_posts` ✅
   - `forum_replies` ✅
   - `hot_topics` ✅
   - `awards` ✅

3. Go back to your app and refresh the page - the connection status should now show **"Connected to Supabase"** ✅

---

## Troubleshooting

### If you get an error "relation already exists"
- This means the table already exists. You can skip that migration or use `CREATE TABLE IF NOT EXISTS` (which is already in the code).

### If you get an error about enum values
- The admin role migration might fail if run multiple times. That's okay - it uses `IF NOT EXISTS`.

### If you get permission errors
- Make sure you're running the SQL as a database admin/superuser in Supabase.

---

## Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed, you can run:

```bash
supabase db push
```

This will automatically apply all migrations in the `supabase/migrations` folder.

---

## ✅ You're Done!

After running all migrations, your Supabase database will have all the required tables, and your registration forms will work properly!






