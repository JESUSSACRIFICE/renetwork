-- Business info for service-provider registration step 4 (fields not on profiles)
-- profiles already has company_name, years_of_experience; this table holds the rest.
create table if not exists public.business_info (
  user_id uuid not null,
  business_address text null,
  business_hours text null,
  best_times_to_reach text null,
  number_of_employees integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint business_info_pkey primary key (user_id),
  constraint business_info_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

comment on table public.business_info is 'Step 4 business details for service providers; company_name and years_of_experience moved here from profiles (see later migration).';
