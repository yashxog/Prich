alter table public.creator_profiles
  drop constraint creator_profiles_verified_phone,
  add constraint creator_profiles_optional_phone
    check (
      (phone_number = '' and phone_verified_at is null)
      or
      phone_number ~ '^\+[1-9][0-9]{7,14}$'
    );

comment on column public.creator_profiles.phone_number is
  'Optional E.164 phone number supplied during onboarding.';
comment on column public.creator_profiles.phone_verified_at is
  'Supabase Auth confirmation timestamp when available; null for unverified optional numbers.';
