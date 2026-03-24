-- Set a single creator on all crowdfunding projects (demo / team account).

UPDATE public.crowdfunding_projects
SET creator_id = '309ca392-0378-4981-a1ca-49329ad17a1e'::uuid;
