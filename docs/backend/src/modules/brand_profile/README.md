# Brand profile API

The brand-profile module owns private brand company details and keeps them separate from authentication credentials.

## Endpoints

- `POST /api/v1/brand/profile/ensure` — idempotently assigns the authenticated identity to the brand account type and creates its profile.
- `GET /api/v1/brand/profile` — returns the authenticated brand's private profile.
- `PUT /api/v1/brand/profile` — validates and stores `companyName`, `website`, and `category`.

All endpoints require a verified Supabase Bearer token. The update endpoint accepts only bounded strings and an HTTP or HTTPS website. Browser database roles have no table access; the server-only repository scopes every operation with the verified UUID.
