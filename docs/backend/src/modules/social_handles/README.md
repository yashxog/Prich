# Social handles API

Creator and brand social identities live in separate `creator_social_handles` and `brand_social_handles` tables. Both tables are keyed to the authenticated Supabase user and allow one X and one LinkedIn identity per role.

- `GET /api/v1/social-handles/creator`
- `PUT /api/v1/social-handles/creator/:platform`
- `GET /api/v1/social-handles/brand`
- `PUT /api/v1/social-handles/brand/:platform`

The API accepts only HTTPS profile URLs on the selected platform's official host. A saved handle identifies the profile; it does not imply that Prich has OAuth access or live platform analytics.
