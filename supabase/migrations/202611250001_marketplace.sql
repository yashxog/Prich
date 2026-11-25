alter table public.account_roles drop constraint account_roles_pkey;
alter table public.account_roles add primary key (user_id, account_type);

create table public.campaigns (
  id bigint generated always as identity primary key,
  brand_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  brief text not null check (char_length(brief) between 1 and 2000),
  platform text not null check (platform in ('x', 'linkedin')),
  reward_amount numeric(12, 2) not null check (reward_amount > 0),
  status text not null default 'open' check (status in ('draft', 'open', 'closed')),
  deadline timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index campaigns_brand_user_id_idx on public.campaigns (brand_user_id);
create index campaigns_open_deadline_idx on public.campaigns (deadline) where status = 'open';

create table public.post_submissions (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  post_url text not null check (char_length(post_url) <= 2048),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  brand_feedback text not null default '' check (char_length(brand_feedback) <= 1000),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (campaign_id, creator_user_id, post_url)
);

create index post_submissions_campaign_id_idx on public.post_submissions (campaign_id);
create index post_submissions_creator_user_id_idx on public.post_submissions (creator_user_id);

create table public.creator_social_handles (
  id bigint generated always as identity primary key,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin')),
  handle text not null check (char_length(handle) between 1 and 100),
  profile_url text not null check (char_length(profile_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_user_id, platform)
);

create index creator_social_handles_creator_user_id_idx
  on public.creator_social_handles (creator_user_id);

create table public.brand_social_handles (
  id bigint generated always as identity primary key,
  brand_user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin')),
  handle text not null check (char_length(handle) between 1 and 100),
  profile_url text not null check (char_length(profile_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_user_id, platform)
);

create index brand_social_handles_brand_user_id_idx
  on public.brand_social_handles (brand_user_id);

alter table public.campaigns enable row level security;
alter table public.post_submissions enable row level security;
alter table public.creator_social_handles enable row level security;
alter table public.brand_social_handles enable row level security;

revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.post_submissions from anon, authenticated;
revoke all on table public.creator_social_handles from anon, authenticated;
revoke all on table public.brand_social_handles from anon, authenticated;
revoke all on sequence public.campaigns_id_seq from anon, authenticated;
revoke all on sequence public.post_submissions_id_seq from anon, authenticated;
revoke all on sequence public.creator_social_handles_id_seq from anon, authenticated;
revoke all on sequence public.brand_social_handles_id_seq from anon, authenticated;

grant all on table public.campaigns to service_role;
grant all on table public.post_submissions to service_role;
grant all on table public.creator_social_handles to service_role;
grant all on table public.brand_social_handles to service_role;
grant all on sequence public.campaigns_id_seq to service_role;
grant all on sequence public.post_submissions_id_seq to service_role;
grant all on sequence public.creator_social_handles_id_seq to service_role;
grant all on sequence public.brand_social_handles_id_seq to service_role;

comment on table public.campaigns is
  'First-party brand commissions for original X or LinkedIn posts.';
comment on table public.post_submissions is
  'Creator post URLs and brand review decisions for Prich campaigns.';
comment on table public.creator_social_handles is
  'Creator-owned social identities, separate from private creator profiles.';
comment on table public.brand_social_handles is
  'Brand-owned social identities, separate from private brand profiles.';
