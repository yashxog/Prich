# Account authentication

Creator authentication uses Supabase Auth with email/password and Google OAuth.

## Signup

1. A creator opens `/creator/signup`.
2. Email signup sends first and last name as identity metadata and requests email confirmation when enabled in Supabase.
3. Google signup redirects through `/auth/callback` using PKCE.
4. Both flows send the access token to `POST /api/v1/creator/profile/ensure` after a valid session exists.
5. The backend verifies the token and writes the profile with its server-only database client.
6. The creator is sent to `/creator/onboarding` to complete the profile before entering the dashboard. A phone number can be added but is optional.

## Login

Existing creators can use email/password or Google at `/creator/login`. The login flow also asks the backend to ensure the creator profile exists, which safely repairs older authenticated users that do not yet have a profile row. Incomplete profiles continue to the centered full-screen `/creator/onboarding` flow; complete profiles continue to the dashboard.

The browser uses Supabase only for identity and session management. It does not query application tables or call database functions directly. Creator profile reads and writes go through the versioned backend API.

## Database records

Email/password credentials for both creators and brands belong exclusively to Supabase Auth. Supabase stores a salted bcrypt hash in `auth.users.encrypted_password`; plaintext passwords are never stored. Application profile tables reference the authenticated user by UUID and must not copy the password or its hash.

`creator_profiles` contains:

- a public display name;
- an optional private E.164 phone number and its verification timestamp when previously confirmed;
- country and niche;
- an optional biography;
- `user_id` — UUID referencing `auth.users`.
- `first_name` and `last_name`.
- `email`.
- `is_linkedin_attached`.
- `is_x_attached`.

`brand_profiles` is a separate table reserved for the brand authentication flow.

## Brand flow

1. A brand opens `/brand/signup` and authenticates with only work email/password or Google.
2. Email confirmation and Google OAuth return through `/auth/callback?next=/brand/onboarding`.
3. The backend assigns the identity to the brand account type and creates a minimal profile containing its UUID and email.
4. The authenticated `/brand/onboarding` screen collects company name, website, and category.
5. Completed profiles continue to `/brand/dashboard`; returning brands with complete profiles go there directly after email login.

Brand company details are collected in a centered full-screen onboarding layout rather than the split authentication layout.

## Optional creator phone number

1. The signed-in creator can leave both phone fields empty and continue onboarding.
2. When supplied, the creator selects a flagged calling code and enters the national number separately. The browser combines them into E.164 form, for example `+919876543210`.
3. The backend validates the optional number at the API boundary and stores it without requiring SMS verification.
4. If the submitted number already matches a Supabase-confirmed phone, the backend preserves its trusted confirmation timestamp; it never accepts a confirmation timestamp from the browser.

The creator's flagged country-of-residence selector remains separate from the phone prefix. Choosing one does not populate or replace the other.

Brand credentials remain exclusively in Supabase Auth. The application table stores `user_id`, `company_name`, `email`, `website`, and `category`.

## Required Supabase configuration

- Apply all SQL files under `supabase/migrations/` in filename order.
- Enable the Google provider under Authentication → Sign In / Providers.
- Add the Google OAuth client ID and secret to Supabase.
- Set the Supabase Site URL to the deployed frontend origin.
- Allow `http://localhost:5173/auth/callback` for local development.
- Allow `https://<production-domain>/auth/callback` for production.
- Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_API_URL` to the frontend environment.
- Add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `FRONTEND_URL` to the backend environment.

The Google client secret and Supabase secret key must remain server-side and outside the frontend environment.
