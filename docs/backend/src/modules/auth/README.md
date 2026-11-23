# Backend authentication

Protected API routes accept a Supabase access token in the `Authorization: Bearer <token>` header. The authentication middleware validates that token with Supabase and adds the trusted user ID and token to request-scoped server locals.

Handlers must never authorize a request using a user ID, email address, role, or account type supplied in the request body or query string. Failed verification returns a safe `401` response; temporary verification outages return `503`.
