-- Add PSP sub-type labels for SearchForm filters (agentTypes, realEstateTypes, crowdfundingTypes, flooringIndoorTypes, flooringOutdoorTypes)
-- Enables filtering profiles and services by nested PSP options

INSERT INTO public.psp_types (label, slug, sort_order, letter) VALUES
  -- Agent sub-types (A)
  ('Insurance', 'insurance', 53, 'A'),
  ('Selling', 'selling', 54, 'A'),
  ('Sell-to-Buy', 'sell_to_buy', 55, 'A'),
  ('Buying', 'buying', 56, 'A'),
  ('Buy-to-Sell', 'buy_to_sell', 57, 'A'),
  ('Leasing', 'leasing', 58, 'A'),
  ('Consulting', 'consulting_agent', 59, 'A'),
  -- Crowdfunding sub-types (C)
  ('Accreditation', 'accreditation', 60, 'C'),
  ('Accredited', 'accredited', 61, 'C'),
  ('Non Accredited', 'non_accredited', 62, 'C'),
  -- Flooring sub-types (F) - Concrete exists as main PSP, use DO NOTHING
  ('Asphalt', 'asphalt', 63, 'F'),
  ('Tile', 'tile', 64, 'F'),
  ('Gravel', 'gravel', 65, 'F'),
  ('Rock', 'rock', 66, 'F'),
  ('Stone', 'stone', 67, 'F')
ON CONFLICT (label) DO NOTHING;
