-- Seed initial community vote items: locations and features
INSERT INTO public.community_vote_items (title, description, item_type, sort_order) VALUES
  -- Locations
  ('Miami, FL', 'Expand RE Network services to the Miami metropolitan area', 'location', 1),
  ('Austin, TX', 'Add Austin and surrounding Texas markets', 'location', 2),
  ('Phoenix, AZ', 'Phoenix metro and Scottsdale area support', 'location', 3),
  ('Denver, CO', 'Mountain region and Denver metro expansion', 'location', 4),
  ('Atlanta, GA', 'Southeast expansion - Atlanta metro', 'location', 5),
  ('Seattle, WA', 'Pacific Northwest market support', 'location', 6),
  ('Chicago, IL', 'Midwest expansion - Chicago metro', 'location', 7),
  ('San Diego, CA', 'Southern California coastal markets', 'location', 8),
  -- Features
  ('Dark Mode', 'System-wide dark theme for comfortable viewing', 'feature', 10),
  ('Mobile App', 'Native iOS and Android apps', 'feature', 11),
  ('Advanced Search Filters', 'More filters: price range, property type, amenities', 'feature', 12),
  ('Saved Searches Alerts', 'Email/push when new listings match your saved search', 'feature', 13),
  ('Video Tours', 'Integrated video walkthrough support for listings', 'feature', 14),
  ('AI-Powered Matching', 'Smart recommendations based on your preferences', 'feature', 15),
  ('Document E-Sign', 'Sign contracts and agreements digitally', 'feature', 16),
  ('Multi-Language Support', 'Spanish, Mandarin, and more language options', 'feature', 17)
;
