-- Assign creator_id on crowdfunding_projects from existing public.profiles (round-robin).
-- Skips when there are no profiles. Only updates rows where creator_id IS NULL.

WITH profile_list AS (
  SELECT id, row_number() OVER (ORDER BY created_at NULLS LAST, id) AS rn
  FROM public.profiles
),
pc AS (
  SELECT COUNT(*)::int AS cnt FROM profile_list
),
numbered AS (
  SELECT cp.id, row_number() OVER (ORDER BY cp.created_at DESC) AS prn
  FROM public.crowdfunding_projects cp
  WHERE cp.creator_id IS NULL
)
UPDATE public.crowdfunding_projects cp
SET creator_id = pl.id
FROM numbered np
CROSS JOIN pc
JOIN profile_list pl
  ON pl.rn = ((np.prn - 1) % GREATEST(pc.cnt, 1)) + 1
WHERE cp.id = np.id
  AND pc.cnt > 0;
