import { Router, type NextFunction, type Request, type Response } from 'express'
import type { ApiErrorResponse, CreatorProfileResponse } from '@prich/shared'
import { authenticateRequest } from '../auth/auth.middleware.js'
import type { AuthenticatedLocals } from '../auth/auth.types.js'
import { ensureCreatorProfile, getCreatorProfile } from './creator_profile.service.js'

interface CreatorProfileRouteDependencies {
  authenticate: typeof authenticateRequest
  ensureProfile: typeof ensureCreatorProfile
  getProfile: typeof getCreatorProfile
}

const DEFAULT_DEPENDENCIES: CreatorProfileRouteDependencies = {
  authenticate: authenticateRequest,
  ensureProfile: ensureCreatorProfile,
  getProfile: getCreatorProfile,
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

  return router
}
