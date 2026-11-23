create table public.creator_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 100),
  last_name text not null default '' check (char_length(last_name) <= 100),
  email text not null check (char_length(email) <= 320),
  is_linkedin_attached boolean not null default false,
  is_x_attached boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brand_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 100),
  last_name text not null default '' check (char_length(last_name) <= 100),
  email text not null check (char_length(email) <= 320),
  company_name text not null default '' check (char_length(company_name) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_profiles enable row level security;
alter table public.brand_profiles enable row level security;

revoke all on table public.creator_profiles from anon, authenticated;
revoke all on table public.brand_profiles from anon, authenticated;

grant all on table public.creator_profiles to service_role;
grant all on table public.brand_profiles to service_role;

comment on table public.creator_profiles is 'Private account records for creators authenticated with Supabase Auth.';
comment on table public.brand_profiles is 'Private account records reserved for the independent brand authentication flow.';
