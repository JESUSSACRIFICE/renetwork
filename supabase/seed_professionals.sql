-- Add 15 more diverse professionals for testing filters

-- Real Estate Agents
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, referral_fee_percentage, experience_level, years_of_experience, languages, willing_to_train, price_per_sqft)
VALUES 
  (gen_random_uuid(), 'Sarah Martinez', 'Martinez Real Estate Group', 'Specializing in luxury residential properties and new construction', '555-0201', NULL, 25, 'expert', 12, ARRAY['English', 'Spanish'], false, 0.015),
  (gen_random_uuid(), 'David Kim', 'Kim & Associates', 'Commercial real estate specialist focusing on retail and office spaces', '555-0202', NULL, 30, 'expert', 15, ARRAY['English', 'Korean'], true, NULL),
  (gen_random_uuid(), 'Jennifer Lee', 'Bay Area Realty', 'Residential expert in move-in ready homes', '555-0203', NULL, 20, 'intermediate', 7, ARRAY['English'], false, NULL);

-- Mortgage Consultants  
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, experience_level, years_of_experience, languages)
VALUES
  (gen_random_uuid(), 'Michael Torres', 'Torres Financial Services', 'FHA and VA loan specialist with competitive rates', '555-0204', 200, 'expert', 18, ARRAY['English', 'Spanish']),
  (gen_random_uuid(), 'Lisa Chen', 'Prime Lending Solutions', 'Residential and commercial mortgage expert', '555-0205', 180, 'intermediate', 9, ARRAY['English', 'Mandarin']),
  (gen_random_uuid(), 'Robert Wilson', 'First Home Mortgage', 'First-time homebuyer specialist', '555-0206', 150, 'intermediate', 6, ARRAY['English']);

-- Contractors
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, experience_level, years_of_experience, languages, willing_to_train)
VALUES
  (gen_random_uuid(), 'James Rodriguez', 'Rodriguez Construction', 'New construction and remodeling specialist', '555-0207', 95, 'expert', 20, ARRAY['English', 'Spanish'], true),
  (gen_random_uuid(), 'Emily Watson', 'Watson Home Improvements', 'Kitchen and bathroom renovation expert', '555-0208', 85, 'intermediate', 8, ARRAY['English'], false),
  (gen_random_uuid(), 'Carlos Sanchez', 'Sanchez General Contracting', 'Commercial and residential general contractor', '555-0209', 110, 'expert', 14, ARRAY['English', 'Spanish'], true);

-- Property Inspectors
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, experience_level, years_of_experience, languages)
VALUES
  (gen_random_uuid(), 'Andrew Thompson', 'Thompson Property Inspections', 'Certified home inspector specializing in new construction', '555-0210', 175, 'expert', 11, ARRAY['English']),
  (gen_random_uuid(), 'Maria Garcia', 'Garcia Inspection Services', 'Commercial property inspection specialist', '555-0211', 190, 'expert', 13, ARRAY['English', 'Spanish']);

-- Real Estate Attorneys
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, experience_level, years_of_experience, languages)
VALUES
  (gen_random_uuid(), 'Daniel Park', 'Park Law Group', 'Real estate transaction and litigation attorney', '555-0212', 350, 'expert', 16, ARRAY['English', 'Korean']),
  (gen_random_uuid(), 'Rachel Cohen', 'Cohen Real Estate Law', 'Residential and commercial real estate attorney', '555-0213', 325, 'expert', 12, ARRAY['English']);

-- Electricians
INSERT INTO profiles (id, full_name, company_name, bio, phone, hourly_rate, experience_level, years_of_experience, languages, willing_to_train)
VALUES
  (gen_random_uuid(), 'Kevin Murphy', 'Murphy Electric', 'Licensed electrician for residential and commercial projects', '555-0214', 90, 'intermediate', 9, ARRAY['English'], true),
  (gen_random_uuid(), 'Jose Martinez', 'Martinez Electrical Services', 'New construction electrical specialist', '555-0215', 85, 'intermediate', 7, ARRAY['English', 'Spanish'], true);

-- Add user roles
WITH agent_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('Sarah Martinez', 'David Kim', 'Jennifer Lee')
),
mortgage_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('Michael Torres', 'Lisa Chen', 'Robert Wilson')
),
contractor_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('James Rodriguez', 'Emily Watson', 'Carlos Sanchez')
),
inspector_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('Andrew Thompson', 'Maria Garcia')
),
attorney_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('Daniel Park', 'Rachel Cohen')
),
electrician_ids AS (
  SELECT id, full_name FROM profiles WHERE full_name IN ('Kevin Murphy', 'Jose Martinez')
)

INSERT INTO user_roles (user_id, role)
SELECT id, 'real_estate_agent' FROM agent_ids
UNION ALL
SELECT id, 'mortgage_consultant' FROM mortgage_ids
UNION ALL
SELECT id, 'general_contractor' FROM contractor_ids
UNION ALL
SELECT id, 'property_inspector' FROM inspector_ids
UNION ALL
SELECT id, 'real_estate_attorney' FROM attorney_ids
UNION ALL
SELECT id, 'electrician' FROM electrician_ids;

-- Add service areas
WITH all_professionals AS (
  SELECT id FROM profiles WHERE full_name IN (
    'Sarah Martinez', 'David Kim', 'Jennifer Lee', 'Michael Torres', 'Lisa Chen', 
    'Robert Wilson', 'James Rodriguez', 'Emily Watson', 'Carlos Sanchez',
    'Andrew Thompson', 'Maria Garcia', 'Daniel Park', 'Rachel Cohen', 'Kevin Murphy', 'Jose Martinez'
  )
)
INSERT INTO service_areas (user_id, zip_code, radius_miles, is_primary)
SELECT 
  id,
  (ARRAY['90210', '94102', '10001', '60601', '33139', '78701', '98101', '02101', '85001', '80202'])[floor(random() * 10 + 1)::int],
  (ARRAY[15, 25, 35, 50])[floor(random() * 4 + 1)::int],
  true
FROM all_professionals;

-- Add payment preferences
WITH all_professionals AS (
  SELECT id FROM profiles WHERE full_name IN (
    'Sarah Martinez', 'David Kim', 'Jennifer Lee', 'Michael Torres', 'Lisa Chen', 
    'Robert Wilson', 'James Rodriguez', 'Emily Watson', 'Carlos Sanchez',
    'Andrew Thompson', 'Maria Garcia', 'Daniel Park', 'Rachel Cohen', 'Kevin Murphy', 'Jose Martinez'
  )
)
INSERT INTO payment_preferences (user_id, accepts_cash, accepts_credit, accepts_financing, payment_terms)
SELECT 
  id,
  true,
  true,
  (random() > 0.5),
  CASE 
    WHEN random() > 0.7 THEN 'Net 30'
    WHEN random() > 0.4 THEN 'Due on completion'
    ELSE '50% deposit, 50% on completion'
  END
FROM all_professionals;
