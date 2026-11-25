# Creator profile API

The creator-profile module owns creator profile business operations and database access.

## Endpoints

- `POST /api/v1/creator/profile/ensure` — idempotently creates or refreshes the authenticated creator's private profile.
- `GET /api/v1/creator/profile` — returns the authenticated creator's private profile.
- `PUT /api/v1/creator/profile` — validates and stores `displayName`, `country`, `niche`, optional `bio`, and an optional E.164 `phoneNumber`. A client-supplied verification timestamp is ignored; a trusted timestamp is preserved only when the number matches the authenticated Supabase user.

A profile is complete when it has a display name, country, and niche. Bio and phone number remain optional.

Both endpoints require a verified Supabase Bearer token. Routes contain only HTTP concerns, services own business behavior, and the repository is the only layer in this module that calls Supabase database APIs. Application tables deny browser roles; the repository uses a server-only secret and explicitly scopes every operation with the verified user ID.
