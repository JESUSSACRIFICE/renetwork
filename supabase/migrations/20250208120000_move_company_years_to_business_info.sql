-- Move company_name and years_of_experience from profiles to business_info to avoid redundancy.

-- Add columns to business_info
alter table public.business_info
  add column if not exists company_name text null,
  add column if not exists years_of_experience integer null;

-- Backfill: create business_info rows from profiles that have company_name or years_of_experience
insert into public.business_info (user_id, company_name, years_of_experience, updated_at)
select id, company_name, years_of_experience, now()
from public.profiles
where company_name is not null or years_of_experience is not null
on conflict (user_id) do update set
  company_name = coalesce(excluded.company_name, business_info.company_name),
  years_of_experience = coalesce(excluded.years_of_experience, business_info.years_of_experience),
  updated_at = now();

-- Remove redundant columns from profiles
alter table public.profiles
  drop column if exists company_name,
  drop column if exists years_of_experience;
