-- Seed sample reviews (reviewer = one profile, profile_id = professional being reviewed).
-- Only runs when we have at least 2 profiles. Safe to run multiple times (no unique constraint on profile_id+reviewer_id).

INSERT INTO reviews (profile_id, reviewer_id, rating, comment)
SELECT
  p1.id,
  p2.id,
  (4 + floor(random() * 2)::int),
  (ARRAY[
    'Very professional and responsive. Would recommend.',
    'Great experience from start to finish.',
    'Knowledgeable and helped us close quickly.',
    'Excellent communication and follow-through.',
    'Top notch service.'
  ])[1 + floor(random() * 5)::int]
FROM (SELECT id, row_number() OVER (ORDER BY id) AS rn FROM profiles LIMIT 10) p1
JOIN (SELECT id, row_number() OVER (ORDER BY id) AS rn FROM profiles LIMIT 10) p2 ON p1.rn <> p2.rn
WHERE NOT EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.profile_id = p1.id AND r.reviewer_id = p2.id
)
LIMIT 15;

-- Backfill payment_preferences for any profile that has none (e.g. customer/PSP signups).
INSERT INTO payment_preferences (user_id, accepts_cash, accepts_credit, accepts_financing, payment_terms)
SELECT p.id, true, true, false, 'Due on completion'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM payment_preferences pp WHERE pp.user_id = p.id);

-- Backfill one service_area for profiles that have none (so "Service areas" section has something).
INSERT INTO service_areas (user_id, zip_code, radius_miles, is_primary)
SELECT p.id, '90210', 25, true
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM service_areas sa WHERE sa.user_id = p.id);
