import { Router, type NextFunction, type Request, type Response } from 'express'
import type {
  ApiErrorResponse,
  CreatorProfileResponse,
  UpdateCreatorProfileInput,
} from '@prich/shared'
import { authenticateRequest } from '../auth/auth.middleware.js'
import type { AuthenticatedLocals } from '../auth/auth.types.js'
import {
  ensureCreatorProfile,
  getCreatorProfile,
  updateCreatorProfile,
} from './creator_profile.service.js'

const E164_PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/

interface CreatorProfileRouteDependencies {
  authenticate: typeof authenticateRequest
  ensureProfile: typeof ensureCreatorProfile
  getProfile: typeof getCreatorProfile
  updateProfile: typeof updateCreatorProfile
}

const DEFAULT_DEPENDENCIES: CreatorProfileRouteDependencies = {
  authenticate: authenticateRequest,
  ensureProfile: ensureCreatorProfile,
  getProfile: getCreatorProfile,
  updateProfile: updateCreatorProfile,
}

/**
 * Validates and normalizes untrusted creator profile input.
 * @param value - The JSON request body supplied by the client.
 * @returns Validated creator details, or null when the body is invalid.
 */
function parseCreatorProfileInput(value: unknown): UpdateCreatorProfileInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const body = value as Record<string, unknown>
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const country = typeof body.country === 'string' ? body.country.trim() : ''
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  const niche = typeof body.niche === 'string' ? body.niche.trim() : ''
  const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''

  if (
    !displayName
    || displayName.length > 160
    || !country
    || country.length > 100
    || !niche
    || niche.length > 100
    || bio.length > 500
    || (phoneNumber !== '' && !E164_PHONE_PATTERN.test(phoneNumber))
  ) {
    return null
  }

  return { bio, country, displayName, niche, phoneNumber }
}

/**
 * Creates the handler that idempotently prepares the authenticated creator profile.
 * @param ensureProfile - The creator-profile creation service.
 * @returns An Express handler for the profile preparation endpoint.
 */
function createEnsureProfileHandler(
  ensureProfile: typeof ensureCreatorProfile,
): (request: Request, response: Response<void | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function ensureProfileHandler(
    _request: Request,
    response: Response<void | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await ensureProfile({
        email: response.locals.email,
        firstName: response.locals.firstName,
        lastName: response.locals.lastName,
        userId: response.locals.userId,
      })
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the handler that returns the authenticated creator profile.
 * @param getProfile - The creator-profile retrieval service.
 * @returns An Express handler for the profile retrieval endpoint.
 */
function createGetProfileHandler(
  getProfile: typeof getCreatorProfile,
): (request: Request, response: Response<CreatorProfileResponse | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function getProfileHandler(
    _request: Request,
    response: Response<CreatorProfileResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await getProfile(response.locals.userId)
      response.json({ profile })
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the handler that stores creator details with an optional phone number.
 * @param updateProfile - The creator-profile update service.
 * @returns An Express handler for creator onboarding details.
 */
function createUpdateProfileHandler(
  updateProfile: typeof updateCreatorProfile,
): (request: Request, response: Response<CreatorProfileResponse | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function updateProfileHandler(
    request: Request,
    response: Response<CreatorProfileResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    const input = parseCreatorProfileInput(request.body)

    if (!input) {
      response.status(400).json({ error: 'Enter a name, country, niche, and a bio no longer than 500 characters.' })
      return
    }

    try {
      const phoneVerifiedAt = input.phoneNumber !== ''
        && input.phoneNumber === response.locals.phoneNumber
        ? response.locals.phoneVerifiedAt
        : null

      response.json({
        profile: await updateProfile(
          response.locals.userId,
          input,
          phoneVerifiedAt,
        ),
      })
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the authenticated creator-profile API router.
 * @param dependencies - Replaceable authentication and service dependencies.
 * @returns An Express router for creator profile operations.
 */
export function createCreatorProfileRouter(
  dependencies: CreatorProfileRouteDependencies = DEFAULT_DEPENDENCIES,
): Router {
  const router = Router()

  router.use(dependencies.authenticate)
  router.post('/ensure', createEnsureProfileHandler(dependencies.ensureProfile))
  router.get('/', createGetProfileHandler(dependencies.getProfile))
  router.put('/', createUpdateProfileHandler(dependencies.updateProfile))

  return router
}
