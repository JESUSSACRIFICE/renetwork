-- Seed sample crowdfunding projects (concept/demo data)
-- These are for display only; no real investments

INSERT INTO public.crowdfunding_projects (
  id,
  title,
  slug,
  short_description,
  description,
  images,
  category,
  location,
  min_investment_cents,
  target_amount_cents,
  raised_amount_cents,
  expected_roi_pct,
  status,
  fund_allocation_json,
  deadline_at
) VALUES
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Family Faith Bowling Center',
  'family-faith-bowling',
  'A Christ-centered bowling alley and family entertainment venue in Dallas, TX.',
  'Our vision is to create a welcoming space where families can enjoy wholesome recreation while building community. The center will feature 24 lanes, a café, arcade, and dedicated space for youth ministry events. All programming aligns with Christian values—no alcohol, family-friendly hours, and opportunities for outreach.',
  ARRAY['/placeholder-bowling.jpg'],
  'recreation',
  'Dallas, TX',
  500000,
  250000000,
  12500000,
  8.50,
  'active',
  '[{"category":"Construction","description":"Building and fit-out","amount_pct":55},{"category":"Equipment","description":"Lanes, pinsetters, arcade","amount_pct":25},{"category":"Operations Reserve","description":"6-month operating budget","amount_pct":15},{"category":"Marketing","description":"Launch and community outreach","amount_pct":5}]'::jsonb,
  now() + interval '90 days'
),
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'Ice Rink & Community Center',
  'ice-rink-community',
  'Year-round ice skating and community gathering space in Nashville.',
  'A faith-based ice rink and community center offering learn-to-skate programs, hockey leagues, and open skate sessions. The facility will host seasonal events, homeschool PE programs, and church youth outings. Designed for all ages and skill levels.',
  ARRAY['/placeholder-ice.jpg'],
  'recreation',
  'Nashville, TN',
  1000000,
  500000000,
  75000000,
  7.25,
  'active',
  '[{"category":"Land & Building","description":"Acquisition and construction","amount_pct":60},{"category":"Ice Equipment","description":"Rink systems, Zamboni","amount_pct":20},{"category":"Operations","description":"First-year operating capital","amount_pct":15},{"category":"Reserve","description":"Contingency","amount_pct":5}]'::jsonb,
  now() + interval '120 days'
),
(
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'Water Park & Campground',
  'water-park-campground',
  'Faith-based water park and family campground in the Ozarks.',
  'Combine summer fun with outdoor ministry. A water park with slides, lazy river, and splash pads, plus an RV and tent campground. Evening worship gatherings, family camps, and retreats. Revenue from both day guests and overnight stays.',
  ARRAY['/placeholder-water.jpg'],
  'entertainment',
  'Branson, MO',
  250000,
  150000000,
  0,
  9.00,
  'active',
  '[{"category":"Development","description":"Site work and construction","amount_pct":50},{"category":"Water Features","description":"Slides, pumps, filtration","amount_pct":30},{"category":"Campground","description":"RV hookups, bathhouses","amount_pct":12},{"category":"Marketing & Reserve","description":"Launch and contingency","amount_pct":8}]'::jsonb,
  now() + interval '180 days'
)
ON CONFLICT (id) DO NOTHING;
