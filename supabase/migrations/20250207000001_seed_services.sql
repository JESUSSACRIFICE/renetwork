-- Seed services: one service per provider for the first 15 profiles.
-- Run after profiles exist (e.g. after seed_professionals.sql or app signups).

INSERT INTO public.services (provider_id, title, category, description, price, delivery_days)
SELECT
  p.id,
  v.title,
  v.category,
  v.description,
  v.price,
  v.delivery_days
FROM (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM public.profiles
  LIMIT 15
) p
JOIN (
  SELECT * FROM (VALUES
    (1, 'Full Home Inspection', 'Property Inspection', 'Complete pre-purchase home inspection including structure, systems, and safety. Covers roof, foundation, HVAC, electrical, and plumbing.', 350, 3),
    (2, 'Commercial Property Inspection', 'Property Inspection', 'Commercial building inspection for buyers and lenders. Includes code compliance and systems review.', 550, 5),
    (3, 'Residential Listing Consultation', 'Real Estate', 'One-on-one consultation for sellers: pricing strategy, staging tips, and marketing plan.', 150, 1),
    (4, 'Buyer Representation', 'Real Estate', 'Full buyer agent services from search to closing. No upfront fee; commission at closing.', 0, 0),
    (5, 'FHA / VA Loan Pre-Approval', 'Mortgage', 'FHA and VA loan pre-approval with competitive rates. Ideal for first-time and veteran buyers.', 0, 2),
    (6, 'Kitchen Remodel Consultation', 'Contractor', 'In-home design and quote for kitchen renovation. Includes measurements and scope of work.', 95, 1),
    (7, 'Electrical Panel Upgrade', 'Trade', 'Upgrade to 200-amp service and panel replacement. Licensed and permitted.', 1200, 2),
    (8, 'Title Review & Closing', 'Legal', 'Real estate title review and closing services. Residential and commercial.', 400, 7),
    (9, 'Property Valuation Report', 'Real Estate', 'Written valuation report for refinance, estate, or dispute. USPAP compliant.', 275, 5),
    (10, 'New Construction Walk-Through', 'Property Inspection', 'Pre-drywall and final walk-through inspection for new construction.', 450, 2),
    (11, 'Refinance Application', 'Mortgage', 'Full refinance application and rate lock. Conventional and government loans.', 0, 3),
    (12, 'Bathroom Renovation Quote', 'Contractor', 'Design and labor quote for bathroom renovation. Materials estimate included.', 0, 1),
    (13, 'HVAC Annual Service', 'Trade', 'Annual HVAC tune-up and safety check. One system per visit.', 125, 1),
    (14, 'Lease Review', 'Legal', 'Residential or commercial lease review and redline.', 200, 3),
    (15, 'Open House Hosting', 'Real Estate', 'Professional open house hosting and lead capture for listing agents.', 150, 1)
  ) AS v(ord, title, category, description, price, delivery_days)
) v ON p.rn = v.ord;
