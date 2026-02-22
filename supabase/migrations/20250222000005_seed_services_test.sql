-- Seed services for testing: 2-3 services per profile
-- Targets profiles with user_type = 'service_provider' (or first 20 profiles if none)
-- Safe to run: only inserts for profiles that have fewer than 3 services

DO $$
DECLARE
  v_provider RECORD;
  v_count int;
  v_services jsonb := '[
    {"title":"Full Home Inspection","category":"Property Inspection","description":"Complete pre-purchase home inspection including structure, systems, and safety. Covers roof, foundation, HVAC, electrical, and plumbing.","price":350,"days":3},
    {"title":"Commercial Property Inspection","category":"Property Inspection","description":"Commercial building inspection for buyers and lenders. Includes code compliance and systems review.","price":550,"days":5},
    {"title":"Residential Listing Consultation","category":"Real Estate","description":"One-on-one consultation for sellers: pricing strategy, staging tips, and marketing plan.","price":150,"days":1},
    {"title":"Buyer Representation","category":"Real Estate","description":"Full buyer agent services from search to closing. No upfront fee; commission at closing.","price":0,"days":0},
    {"title":"FHA / VA Loan Pre-Approval","category":"Mortgage","description":"FHA and VA loan pre-approval with competitive rates. Ideal for first-time and veteran buyers.","price":0,"days":2},
    {"title":"Kitchen Remodel Consultation","category":"Contractor","description":"In-home design and quote for kitchen renovation. Includes measurements and scope of work.","price":95,"days":1},
    {"title":"Electrical Panel Upgrade","category":"Trade","description":"Upgrade to 200-amp service and panel replacement. Licensed and permitted.","price":1200,"days":2},
    {"title":"Title Review & Closing","category":"Legal","description":"Real estate title review and closing services. Residential and commercial.","price":400,"days":7},
    {"title":"Property Valuation Report","category":"Real Estate","description":"Written valuation report for refinance, estate, or dispute. USPAP compliant.","price":275,"days":5},
    {"title":"New Construction Walk-Through","category":"Property Inspection","description":"Pre-drywall and final walk-through inspection for new construction.","price":450,"days":2},
    {"title":"Refinance Application","category":"Mortgage","description":"Full refinance application and rate lock. Conventional and government loans.","price":0,"days":3},
    {"title":"Bathroom Renovation Quote","category":"Contractor","description":"Design and labor quote for bathroom renovation. Materials estimate included.","price":0,"days":1},
    {"title":"HVAC Annual Service","category":"Trade","description":"Annual HVAC tune-up and safety check. One system per visit.","price":125,"days":1},
    {"title":"Lease Review","category":"Legal","description":"Residential or commercial lease review and redline.","price":200,"days":3},
    {"title":"Open House Hosting","category":"Real Estate","description":"Professional open house hosting and lead capture for listing agents.","price":150,"days":1},
    {"title":"Roof Inspection","category":"Property Inspection","description":"Detailed roof inspection with written report and photos.","price":225,"days":2},
    {"title":"Pool & Spa Inspection","category":"Property Inspection","description":"Pool equipment, safety, and structural inspection.","price":175,"days":1},
    {"title":"1031 Exchange Consultation","category":"Real Estate","description":"Tax-deferred exchange consultation and coordination.","price":300,"days":5},
    {"title":"Plumbing Repair Estimate","category":"Trade","description":"In-home estimate for plumbing repairs and upgrades.","price":0,"days":1},
    {"title":"Estate Sale Coordination","category":"Real Estate","description":"Coordinate estate sale with appraisers, auctioneers, and buyers.","price":250,"days":7}
  ]'::jsonb;
  v_idx int;
  v_svc jsonb;
BEGIN
  FOR v_provider IN
    SELECT p.id
    FROM public.profiles p
    WHERE (p.user_type = 'service_provider' OR p.user_type IS NULL)
      AND (SELECT count(*) FROM public.services s WHERE s.provider_id = p.id) < 3
    ORDER BY p.id
    LIMIT 20
  LOOP
    v_count := (SELECT count(*) FROM public.services WHERE provider_id = v_provider.id);
    v_idx := 0;
    WHILE v_count < 3 AND v_idx < 20 LOOP
      v_svc := v_services->(v_idx % 20);
      INSERT INTO public.services (provider_id, title, category, description, price, delivery_days)
      SELECT
        v_provider.id,
        v_svc->>'title',
        v_svc->>'category',
        v_svc->>'description',
        (v_svc->>'price')::numeric,
        (v_svc->>'days')::int
      WHERE NOT EXISTS (
        SELECT 1 FROM public.services s
        WHERE s.provider_id = v_provider.id AND s.title = (v_svc->>'title')
      );
      v_count := (SELECT count(*) FROM public.services WHERE provider_id = v_provider.id);
      v_idx := v_idx + 1;
    END LOOP;
  END LOOP;
END $$;

-- Ensure service_areas exist for providers with services (for map/search)
INSERT INTO public.service_areas (user_id, zip_code, radius_miles, is_primary)
SELECT DISTINCT s.provider_id, '90210', 25, true
FROM public.services s
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_areas sa WHERE sa.user_id = s.provider_id
);
