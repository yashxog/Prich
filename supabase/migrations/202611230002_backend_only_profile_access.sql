revoke all on table public.creator_profiles from anon, authenticated;
revoke all on table public.brand_profiles from anon, authenticated;

drop function if exists public.ensure_creator_profile();

comment on table public.creator_profiles is
  'Private creator account records accessible only through the authenticated backend API.';
comment on table public.brand_profiles is
  'Private brand account records accessible only through the authenticated backend API.';
