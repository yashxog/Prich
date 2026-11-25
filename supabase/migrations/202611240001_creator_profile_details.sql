alter table public.creator_profiles
  add column display_name text not null default '',
  add column phone_number text not null default '',
  add column phone_verified_at timestamptz,
  add column country text not null default '',
  add column niche text not null default '',
  add column bio text not null default '';

update public.creator_profiles
set display_name = trim(concat_ws(' ', first_name, last_name))
where display_name = '';

alter table public.creator_profiles
  add constraint creator_profiles_display_name_length
    check (char_length(display_name) <= 160),
  add constraint creator_profiles_verified_phone
    check (
      (phone_number = '' and phone_verified_at is null)
      or
      (phone_number ~ '^\+[1-9][0-9]{7,14}$' and phone_verified_at is not null)
    ),
  add constraint creator_profiles_country_length
    check (char_length(country) <= 100),
  add constraint creator_profiles_niche_length
    check (char_length(niche) <= 100),
  add constraint creator_profiles_bio_length
    check (char_length(bio) <= 500);

comment on column public.creator_profiles.phone_number is
  'E.164 phone number copied from Supabase Auth only after phone confirmation.';
comment on column public.creator_profiles.phone_verified_at is
  'Server-derived Supabase Auth phone confirmation timestamp; never accepted from client input.';
