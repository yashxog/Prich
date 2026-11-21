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

Copy each `.env.example` to `.env` only when you need to override its defaults.

## Production

Run `npm run build`. Deploy `frontend` and `backend` as separate services from this single repository.
