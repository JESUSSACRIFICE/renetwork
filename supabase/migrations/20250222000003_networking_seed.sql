-- Seed sample network posts (requires at least one profile)
-- Run after networking_module migration

DO $$
DECLARE
  aid uuid;
BEGIN
  SELECT id INTO aid FROM public.profiles LIMIT 1;
  IF aid IS NOT NULL THEN
    INSERT INTO public.network_posts (author_id, title, content, type, deal_details, created_at)
    VALUES
      (aid, 'Looking for JV partner on 12-unit multifamily in Austin',
       'Experienced investor seeking a partner for a value-add multifamily deal. 12 units, strong cash flow potential. Looking for 50/50 equity split. DM me if interested.',
       'deal', '{"property_type":"multifamily","location":"Austin, TX","units":12,"structure":"equity"}'::jsonb,
       now() - interval '2 days'),
      (aid, '5 Tips for First-Time Commercial Buyers',
       'After closing my first commercial deal last month, I wanted to share what I learned. 1) Build your team early. 2) Understand cap rates. 3) Run the numbers three times. 4) Don''t skip due diligence. 5) Have an exit strategy before you buy.',
       'blog', '{}'::jsonb, now() - interval '5 days'),
      (aid, NULL, 'Just closed on a beautiful 4-plex in Nashville! Grateful for this community.',
       'post', '{}'::jsonb, now() - interval '1 day');
  END IF;
END $$;
