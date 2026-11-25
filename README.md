# Prich

**Prich is a creator marketplace for performance-based posts on X and LinkedIn.**

The platform uses a production-oriented TypeScript monorepo with independently deployable frontend and backend services.

## Structure

```text
frontend/  Vite + React + TypeScript
backend/   Express + TypeScript API
shared/    Types shared by both applications
```

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer

## Start locally

Install dependencies from the repository root:

```bash
npm install
```

Run the API in one terminal:

```bash
npm run dev:backend
```

Run the frontend in another terminal:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`. The API runs at `http://localhost:3000`.

## Environment

Copy `frontend/.env.example` to `frontend/.env` and configure the browser-safe values:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://localhost:3000
```

Copy `backend/.env.example` to `backend/.env` and configure the API:

```text
PORT=3000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-only-secret-key
```

For local development, configuring either `localhost` or `127.0.0.1` also permits the equivalent loopback origin on the same port. Production CORS remains restricted to the exact `FRONTEND_URL` origin.

Apply the SQL files under `supabase/migrations/` to the matching Supabase project. The frontend uses Supabase for authentication; all application data access goes through the backend. Never place `SUPABASE_SECRET_KEY` in a `VITE_` variable or expose it to the browser.

## Production

Run `npm run build`. Deploy `frontend` and `backend` as separate Vercel projects from this repository. Configure `VITE_API_URL` with the deployed API origin and configure `FRONTEND_URL` with the exact deployed frontend origin.
