create table public.account_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('brand', 'creator')),
  created_at timestamptz not null default now()
);

alter table public.account_roles enable row level security;
revoke all on table public.account_roles from anon, authenticated;
grant all on table public.account_roles to service_role;

insert into public.account_roles (user_id, account_type)
select user_id, 'creator'
from public.creator_profiles
on conflict (user_id) do nothing;

insert into public.account_roles (user_id, account_type)
select user_id, 'brand'
from public.brand_profiles
on conflict (user_id) do nothing;

alter table public.brand_profiles
  drop column first_name,
  drop column last_name,
  add column website text not null default '' check (char_length(website) <= 2048),
  add column category text not null default '' check (char_length(category) <= 100);

comment on table public.account_roles is
  'Backend-only account type assignments preventing one identity from crossing creator and brand authorization boundaries.';
comment on table public.brand_profiles is
  'Private brand company profiles. Password hashes remain exclusively in auth.users and are never duplicated here.';
