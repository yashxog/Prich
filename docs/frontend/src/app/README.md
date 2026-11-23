# Frontend application

The React application uses browser routes for the public landing page, creator authentication, the OAuth callback, and the creator workspace.

## Routes

- `/` — public landing and account-role selection.
- `/creator/signup` — creator email/password and Google registration.
- `/creator/login` — creator email/password and Google login.
- `/auth/callback` — Supabase PKCE exchange and creator-profile preparation.
- `/creator/dashboard` — authenticated creator workspace entry point.

Authentication details are documented under `docs/frontend/src/features/auth/`.

The application calls the backend configured by `VITE_API_URL` for profile data and business operations. Browser code must not access application database tables directly.
