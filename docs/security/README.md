# Security

## Authentication rules

- Supabase Auth owns passwords, OAuth identities, sessions, and email verification. For every email/password account, whether creator or brand, Supabase stores only a salted bcrypt hash in `auth.users.encrypted_password`.
- Never add password or password-hash columns to `creator_profiles`, `brand_profiles`, or another application table. Both account types reference `auth.users` by `user_id`, so duplicating credential material would increase exposure without improving authentication.
- The browser receives only the project URL and publishable key. Secret and service-role keys must never use the `VITE_` prefix or enter frontend code.
- The frontend uses Supabase only for authentication and session management. All application-table access, authorization decisions, verification, and business rules belong to the backend API.
- The backend independently verifies each Bearer token with Supabase before any protected handler runs. It never trusts a user ID supplied by the browser.
- Application tables grant no access to `anon` or `authenticated`, so browser sessions cannot query them directly.
- The backend secret key is server-only and may bypass Row Level Security. Every repository query must therefore scope reads and writes with the user ID established by token verification.
- Creator profile creation is an idempotent backend upsert using identity data returned by Supabase token verification.
- Social-connection flags cannot be modified directly by creators. Future verified OAuth connection services will update them.
- Authentication redirects accept only internal `/creator/` destinations to prevent open redirects.
- Brand and creator records use separate profile tables. Authentication alone never grants authorization to another account type.
- `account_roles` assigns each Supabase UUID to exactly one account type. Profile creation claims and verifies that role before writing, preventing a creator session from crossing into brand APIs and vice versa.
- Brand company details are accepted only after authentication and are validated at the API boundary; websites must use HTTP or HTTPS.
- API responses expose safe errors, request bodies are size-bounded, CORS is restricted to the configured frontend, and requests are rate-limited.

## Sensitive data

Names and email addresses are private account data. Do not include them in logs, analytics events, error messages, or public creator search records without an explicit product decision and user consent.
