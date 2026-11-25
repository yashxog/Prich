import type { NextFunction, Request, Response } from 'express'
import type { ApiErrorResponse } from '@prich/shared'
import { getBackendClient } from '../../services/supabase_client.js'
import type { AuthenticatedLocals } from './auth.types.js'

/**
 * Extracts a Bearer token from an Authorization header.
 * @param authorizationHeader - The untrusted HTTP Authorization header.
 * @returns The token, or null when the header is absent or malformed.
 */
function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null
  }

  const match = /^Bearer\s+([^\s]+)$/i.exec(authorizationHeader)
  return match?.[1] ?? null
}

/**
 * Normalizes untrusted identity metadata into a bounded profile name.
 * @param value - The metadata value supplied by the identity provider.
 * @returns A trimmed name no longer than the database limit.
 */
function normalizeName(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 100) : ''
}

/**
 * Verifies a Supabase access token and exposes its trusted user ID to handlers.
 * @param request - The incoming Express request.
 * @param response - The Express response with authenticated locals.
 * @param next - The next Express middleware function.
 * @returns A promise resolved after authentication succeeds or a safe 401 is sent.
 */
export async function authenticateRequest(
  request: Request,
  response: Response<ApiErrorResponse, AuthenticatedLocals>,
  next: NextFunction,
): Promise<void> {
  const accessToken = getBearerToken(request.header('authorization'))

  if (!accessToken) {
    response.status(401).json({ error: 'Authentication is required.' })
    return
  }

  try {
    const { data, error } = await getBackendClient().auth.getUser(accessToken)

    if (error || !data.user) {
      response.status(401).json({ error: 'The session is invalid or has expired.' })
      return
    }

    const metadata = data.user.user_metadata
    response.locals.email = (data.user.email ?? '').slice(0, 320)
    response.locals.firstName = normalizeName(metadata.first_name ?? metadata.given_name)
    response.locals.lastName = normalizeName(metadata.last_name ?? metadata.family_name)
    response.locals.phoneNumber = data.user.phone ?? ''
    response.locals.phoneVerifiedAt = data.user.phone_confirmed_at ?? null
    response.locals.userId = data.user.id
    next()
  } catch {
    response.status(503).json({ error: 'Authentication is temporarily unavailable.' })
  }
}
