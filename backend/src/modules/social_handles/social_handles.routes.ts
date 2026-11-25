import { Router, type NextFunction, type Request, type Response } from 'express'
import type { ApiErrorResponse, SocialHandle, SocialHandlesResponse, SocialPlatform } from '@prich/shared'
import { authenticateRequest } from '../auth/auth.middleware.js'
import type { AuthenticatedLocals } from '../auth/auth.types.js'
import {
  listBrandSocialHandles,
  listCreatorSocialHandles,
  upsertBrandSocialHandle,
  upsertCreatorSocialHandle,
} from './social_handles.repository.js'

interface SocialHandleRouteDependencies {
  authenticate: typeof authenticateRequest
  listBrand: typeof listBrandSocialHandles
  listCreator: typeof listCreatorSocialHandles
  saveBrand: typeof upsertBrandSocialHandle
  saveCreator: typeof upsertCreatorSocialHandle
}

const DEFAULT_DEPENDENCIES: SocialHandleRouteDependencies = {
  authenticate: authenticateRequest,
  listBrand: listBrandSocialHandles,
  listCreator: listCreatorSocialHandles,
  saveBrand: upsertBrandSocialHandle,
  saveCreator: upsertCreatorSocialHandle,
}

/**
 * Validates a social profile input for one supported platform.
 * @param value - The untrusted JSON body.
 * @param platform - The platform selected in the request path.
 * @returns A normalized social handle, or null when invalid.
 */
function parseSocialHandle(value: unknown, platform: SocialPlatform): SocialHandle | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const body = value as Record<string, unknown>
  const handle = typeof body.handle === 'string' ? body.handle.trim().replace(/^@/, '') : ''
  const profileUrl = typeof body.profileUrl === 'string' ? body.profileUrl.trim() : ''

  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(handle) || profileUrl.length > 2048) {
    return null
  }

  try {
    const url = new URL(profileUrl)
    const hostname = url.hostname.toLowerCase()
    const validHost = platform === 'x'
      ? ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(hostname)
      : ['linkedin.com', 'www.linkedin.com'].includes(hostname)

    if (url.protocol !== 'https:' || !validHost) {
      return null
    }

    return { handle, platform, profileUrl: url.toString() }
  } catch {
    return null
  }
}

/**
 * Creates routes for creator and brand social identities.
 * @param dependencies - Replaceable authentication and repository dependencies.
 * @returns An authenticated social-handle router.
 */
export function createSocialHandleRouter(
  dependencies: SocialHandleRouteDependencies = DEFAULT_DEPENDENCIES,
): Router {
  const router = Router()
  router.use(dependencies.authenticate)

  const roleRoutes = [
    { list: dependencies.listCreator, role: 'creator', save: dependencies.saveCreator },
    { list: dependencies.listBrand, role: 'brand', save: dependencies.saveBrand },
  ] as const

  for (const roleRoute of roleRoutes) {
    router.get(`/${roleRoute.role}`, async (
      _request: Request,
      response: Response<SocialHandlesResponse | ApiErrorResponse, AuthenticatedLocals>,
      next: NextFunction,
    ): Promise<void> => {
      try {
        response.json({ handles: await roleRoute.list(response.locals.userId) })
      } catch (error) {
        next(error)
      }
    })

    router.put(`/${roleRoute.role}/:platform`, async (
      request: Request<{ platform: string }>,
      response: Response<{ handle: SocialHandle } | ApiErrorResponse, AuthenticatedLocals>,
      next: NextFunction,
    ): Promise<void> => {
      const platform = request.params.platform

      if (platform !== 'x' && platform !== 'linkedin') {
        response.status(400).json({ error: 'Choose X or LinkedIn.' })
        return
      }

      const handle = parseSocialHandle(request.body, platform)

      if (!handle) {
        response.status(400).json({ error: `Enter a valid ${platform === 'x' ? 'X' : 'LinkedIn'} handle and profile URL.` })
        return
      }

      try {
        response.json({ handle: await roleRoute.save(response.locals.userId, handle) })
      } catch (error) {
        next(error)
      }
    })
  }

  return router
}
