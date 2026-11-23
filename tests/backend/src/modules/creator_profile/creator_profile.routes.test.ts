import express, { type NextFunction, type Request, type Response } from 'express'
import type { CreatorProfile } from '@prich/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../../../../backend/src/app.js'
import { errorHandler } from '../../../../../backend/src/middleware/error_handler.js'
import type { AuthenticatedLocals } from '../../../../../backend/src/modules/auth/auth.types.js'
import type { CreatorProfileIdentity } from '../../../../../backend/src/modules/creator_profile/creator_profile.repository.js'
import { createCreatorProfileRouter } from '../../../../../backend/src/modules/creator_profile/creator_profile.routes.js'

const PROFILE: CreatorProfile = {
  email: 'asha@example.com',
  firstName: 'Asha',
  isLinkedInAttached: false,
  isXAttached: false,
  lastName: 'Rao',
  userId: '7841d8d6-7a6c-42d0-bbd2-aea16431a112',
}

/**
 * Provides a deterministic authenticated identity to route tests.
 * @param _request - The unused Express request.
 * @param response - The response containing trusted authentication locals.
 * @param next - The next Express middleware.
 * @returns A resolved promise after forwarding the request.
 */
async function authenticateForTest(
  _request: Request,
  response: Response<unknown, AuthenticatedLocals>,
  next: NextFunction,
): Promise<void> {
  response.locals.email = PROFILE.email
  response.locals.firstName = PROFILE.firstName
  response.locals.lastName = PROFILE.lastName
  response.locals.userId = PROFILE.userId
  next()
}

/**
 * Creates a test application with replaceable creator-profile services.
 * @param ensureProfile - The profile creation service double.
 * @param getProfile - The profile retrieval service double.
 * @returns An Express application exposing creator profile routes.
 */
function createTestApp(
  ensureProfile: (identity: CreatorProfileIdentity) => Promise<void>,
  getProfile: (userId: string) => Promise<CreatorProfile>,
): express.Express {
  const app = express()
  app.use('/api/v1/creator/profile', createCreatorProfileRouter({
    authenticate: authenticateForTest,
    ensureProfile,
    getProfile,
  }))
  app.use(errorHandler)
  return app
}

describe('creator profile routes', () => {
  it('rejects requests without an access token', async () => {
    const response = await request(createApp()).get('/api/v1/creator/profile').expect(401)

    expect(response.body).toEqual({ error: 'Authentication is required.' })
  })

  it('ensures a profile through the authenticated backend', async () => {
    const ensureProfile = vi.fn<(identity: CreatorProfileIdentity) => Promise<void>>().mockResolvedValue()
    const getProfile = vi.fn<(userId: string) => Promise<CreatorProfile>>()

    await request(createTestApp(ensureProfile, getProfile))
      .post('/api/v1/creator/profile/ensure')
      .expect(204)

    expect(ensureProfile).toHaveBeenCalledWith({
      email: PROFILE.email,
      firstName: PROFILE.firstName,
      lastName: PROFILE.lastName,
      userId: PROFILE.userId,
    })
  })

  it('returns the authenticated creator profile contract', async () => {
    const ensureProfile = vi.fn<(identity: CreatorProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<CreatorProfile>>().mockResolvedValue(PROFILE)

    const response = await request(createTestApp(ensureProfile, getProfile))
      .get('/api/v1/creator/profile')
      .expect(200)

    expect(response.body).toEqual({ profile: PROFILE })
    expect(getProfile).toHaveBeenCalledWith(PROFILE.userId)
  })

  it('returns a safe error when profile retrieval fails', async () => {
    const ensureProfile = vi.fn<(identity: CreatorProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<CreatorProfile>>()
      .mockRejectedValue(new Error('database details'))

    const response = await request(createTestApp(ensureProfile, getProfile))
      .get('/api/v1/creator/profile')
      .expect(500)

    expect(response.body).toEqual({ error: 'The request could not be completed.' })
  })
})
