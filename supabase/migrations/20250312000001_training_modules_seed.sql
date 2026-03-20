-- Seed training modules (maps to existing /referral/learn content)
INSERT INTO public.training_modules (slug, title, description, duration_minutes, link_url, sort_order)
VALUES
  ('collaboration', 'Collaboration Agreement', 'Understand referral splitting, teaching commitments, and platform exclusivity when you refer or receive referrals.', 15, '/referral/learn/collaboration', 1),
  ('sender-contract', 'Sender Contract', 'For referral senders: commission structure, exclusivity, and reporting obligations.', 10, '/referral/learn/sender-contract', 2),
  ('recipient-contract', 'Recipient Contract', 'For referral recipients: service delivery, referral fee obligations, and training commitments.', 10, '/referral/learn/recipient-contract', 3),
  ('escrow', 'Escrow & Payments', 'How escrow protects your funds. Order, work in progress, and payment release.', 10, '/referral/learn/escrow', 4),
  ('exclusivity', 'Platform Exclusivity', 'Non-compete, no recruit, and platform exclusivity terms.', 8, '/referral/learn/exclusivity', 5),
  ('legal', 'Legal Disclosures', 'Important legal information for referrals and transactions.', 8, '/referral/learn/legal', 6),
  ('tos', 'Terms of Service', 'Platform terms, fees, and user obligations.', 10, '/referral/learn/tos', 7),
  ('privacy', 'Privacy Policy', 'How we collect, use, and protect your data.', 5, '/referral/learn/privacy', 8)
ON CONFLICT (slug) DO NOTHING;
