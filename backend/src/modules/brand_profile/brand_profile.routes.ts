import { Router, type NextFunction, type Request, type Response } from 'express'
import type {
  ApiErrorResponse,
  BrandProfileResponse,
  UpdateBrandProfileInput,
} from '@prich/shared'
import { authenticateRequest } from '../auth/auth.middleware.js'
import type { AuthenticatedLocals } from '../auth/auth.types.js'
import {
  ensureBrandProfile,
  getBrandProfile,
  updateBrandProfile,
} from './brand_profile.service.js'

interface BrandProfileRouteDependencies {
  authenticate: typeof authenticateRequest
  ensureProfile: typeof ensureBrandProfile
  getProfile: typeof getBrandProfile
  updateProfile: typeof updateBrandProfile
}

const DEFAULT_DEPENDENCIES: BrandProfileRouteDependencies = {
  authenticate: authenticateRequest,
  ensureProfile: ensureBrandProfile,
  getProfile: getBrandProfile,
  updateProfile: updateBrandProfile,
}

/**
 * Validates and normalizes untrusted brand profile input.
 * @param value - The JSON request body supplied by the client.
 * @returns Validated company details, or null when the body is invalid.
 */
function parseBrandProfileInput(value: unknown): UpdateBrandProfileInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const body = value as Record<string, unknown>
  const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const website = typeof body.website === 'string' ? body.website.trim() : ''

  if (!companyName || companyName.length > 160 || !category || category.length > 100 || website.length > 2048) {
    return null
  }

  try {
    const parsedWebsite = new URL(website)

    if (parsedWebsite.protocol !== 'https:' && parsedWebsite.protocol !== 'http:') {
      return null
    }

    return { category, companyName, website: parsedWebsite.toString() }
  } catch {
    return null
  }
}

/**
 * Creates the handler that idempotently prepares the authenticated brand profile.
 * @param ensureProfile - The brand-profile creation service.
 * @returns An Express handler for the profile preparation endpoint.
 */
function createEnsureProfileHandler(
  ensureProfile: typeof ensureBrandProfile,
): (request: Request, response: Response<void | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function ensureProfileHandler(
    _request: Request,
    response: Response<void | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await ensureProfile({ email: response.locals.email, userId: response.locals.userId })
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the handler that returns the authenticated brand profile.
 * @param getProfile - The brand-profile retrieval service.
 * @returns An Express handler for the profile retrieval endpoint.
 */
function createGetProfileHandler(
  getProfile: typeof getBrandProfile,
): (request: Request, response: Response<BrandProfileResponse | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function getProfileHandler(
    _request: Request,
    response: Response<BrandProfileResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    try {
      response.json({ profile: await getProfile(response.locals.userId) })
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the handler that validates and stores authenticated brand details.
 * @param updateProfile - The brand-profile update service.
 * @returns An Express handler for the company details endpoint.
 */
function createUpdateProfileHandler(
  updateProfile: typeof updateBrandProfile,
): (request: Request, response: Response<BrandProfileResponse | ApiErrorResponse, AuthenticatedLocals>, next: NextFunction) => Promise<void> {
  return async function updateProfileHandler(
    request: Request,
    response: Response<BrandProfileResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> {
    const input = parseBrandProfileInput(request.body)

    if (!input) {
      response.status(400).json({
        error: 'Enter a company name, category, and valid HTTP or HTTPS website.',
      })
      return
    }

    try {
      response.json({ profile: await updateProfile(response.locals.userId, input) })
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Creates the authenticated brand-profile API router.
 * @param dependencies - Replaceable authentication and service dependencies.
 * @returns An Express router for brand profile operations.
 */
export function createBrandProfileRouter(
  dependencies: BrandProfileRouteDependencies = DEFAULT_DEPENDENCIES,
): Router {
  const router = Router()

  router.use(dependencies.authenticate)
  router.post('/ensure', createEnsureProfileHandler(dependencies.ensureProfile))
  router.get('/', createGetProfileHandler(dependencies.getProfile))
  router.put('/', createUpdateProfileHandler(dependencies.updateProfile))

  return router
}
