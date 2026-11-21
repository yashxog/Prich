# Prich Agent Guide

## Scope
Apply these rules to the whole repository. Keep changes small, typed, tested, secure, and production-ready. Do not change architecture or dependencies without explaining why.

## Repository
```text
frontend/src/           React app; features/<feature>/, components/, services/, hooks/
backend/src/            API; modules/<feature>/ with routes, service, schema, repository
shared/src/             Shared API contracts and framework-neutral types
tests/                  Mirrors source paths under frontend/, backend/, and shared/
docs/                   Mirrors code paths; security/ and decisions/ are repository-wide
```
Group code by business functionality. Keep feature-specific code inside its feature/module; move code to shared only when multiple features genuinely reuse it.

## Technology
- Vite — frontend tooling and production builds.
- React + TypeScript — accessible, component-based UI with strict typing.
- Express + TypeScript — HTTP API.
- Vitest + Testing Library — unit and component tests.
- Supertest — API integration tests.
- npm workspaces — monorepo dependency and script management.

## Naming
- Folders and non-component files: `snake_case`; React components and types: `PascalCase`.
- Variables/functions: `camelCase`; constants/env keys: `SCREAMING_SNAKE_CASE`.
- Tests: `<source-name>.test.ts` or `.test.tsx`; schemas/routes/services: `<feature>.<role>.ts`.
- Prefer named exports; default exports are allowed only for app entry components/config files.

## Engineering and APIs
- Keep strict TypeScript; avoid `any`, hidden side effects, duplication, and oversized modules.
- Give every function explicit parameter and return types; create named types/interfaces for domain data and reuse shared contracts.
- Place concise TSDoc immediately above each function in its source file, state its purpose, each input with `@param`, and the returned value with `@returns` (or note that it returns nothing).
- Keep documentation accurate when behavior, inputs, or outputs change; do not add comments that merely repeat the code.
- Validate every untrusted input at the API boundary; return consistent status codes and safe error bodies.
- Version business APIs under `/api/v1`; keep handlers thin and business logic in services.
- Use async error handling, structured logs, timeouts, pagination, and idempotency where relevant.
- Preserve backward compatibility or document the migration in `docs/decisions/`.

## Security and Safety
- Never commit secrets or log credentials, tokens, personal data, or raw sensitive payloads.
- Enforce authentication and authorization server-side; use least privilege and deny by default.
- Use parameterized database queries, bounded request bodies, restrictive CORS, rate limits, and secure headers.
- Do not run destructive commands, migrations, or production actions without explicit approval and a rollback plan.

## Tests and Definition of Done
- Every behavior change requires tests. Mirror the source path, e.g. `backend/src/modules/auth/tokens.ts` → `tests/backend/src/modules/auth/tokens.test.ts`.
- Test public behavior, success/error paths, authorization boundaries, and regressions; do not test implementation details.
- Before completion run: `npm test`, `npm run typecheck`, and `npm run build`.
- Review the diff for security, accessibility, error handling, accidental secrets, and unrelated changes.
- Update relevant documentation when behavior, APIs, architecture, setup, or security assumptions change.
- Mirror documented code paths exactly: `frontend/auth/` → `docs/frontend/auth/`; keep repository-wide security and decisions at the docs root.
