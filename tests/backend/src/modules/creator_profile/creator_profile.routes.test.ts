import express, { type NextFunction, type Request, type Response } from 'express'
import type { CreatorProfile, UpdateCreatorProfileInput } from '@prich/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../../../../backend/src/app.js'
import { errorHandler } from '../../../../../backend/src/middleware/error_handler.js'
import type { AuthenticatedLocals } from '../../../../../backend/src/modules/auth/auth.types.js'
import type { CreatorProfileIdentity } from '../../../../../backend/src/modules/creator_profile/creator_profile.repository.js'
import { createCreatorProfileRouter } from '../../../../../backend/src/modules/creator_profile/creator_profile.routes.js'

const PROFILE: CreatorProfile = {
  bio: 'I make fintech approachable.',
  country: 'India',
  displayName: 'Asha Rao',
  email: 'asha@example.com',
  firstName: 'Asha',
  isComplete: true,
  isLinkedInAttached: false,
  isPhoneVerified: true,
  isXAttached: false,
  lastName: 'Rao',
  niche: 'Fintech',
  phoneNumber: '+919876543210',
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
  response.locals.phoneNumber = PROFILE.phoneNumber
  response.locals.phoneVerifiedAt = '2026-11-24T08:00:00.000Z'
  response.locals.userId = PROFILE.userId
  next()
}

/**
 * Creates a test application with replaceable creator-profile services.
 * @param ensureProfile - The profile creation service double.
 * @param getProfile - The profile retrieval service double.
 * @param updateProfile - The profile update service double.
 * @returns An Express application exposing creator profile routes.
 */
function createTestApp(
  ensureProfile: (identity: CreatorProfileIdentity) => Promise<void>,
  getProfile: (userId: string) => Promise<CreatorProfile>,
  updateProfile: (
    userId: string,
    input: UpdateCreatorProfileInput,
    phoneVerifiedAt: string | null,
  ) => Promise<CreatorProfile> = updateProfileForTest,
): express.Express {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/creator/profile', createCreatorProfileRouter({
    authenticate: authenticateForTest,
    ensureProfile,
    getProfile,
    updateProfile,
  }))
  app.use(errorHandler)
  return app
}

/**
 * Returns the fixture profile for route tests that do not exercise updates.
 * @param _userId - The unused authenticated creator ID.
 * @param _input - The unused creator profile input.
 * @param _phoneVerifiedAt - The unused verification timestamp.
 * @returns The creator profile fixture.
 */
async function updateProfileForTest(
  _userId: string,
  _input: UpdateCreatorProfileInput,
  _phoneVerifiedAt: string | null,
): Promise<CreatorProfile> {
  return PROFILE
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

  it('stores an optional client phone while ignoring a client verification timestamp', async () => {
    const ensureProfile = vi.fn<(identity: CreatorProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<CreatorProfile>>()
    const updateProfile = vi.fn<(
      userId: string,
      input: UpdateCreatorProfileInput,
      phoneVerifiedAt: string | null,
    ) => Promise<CreatorProfile>>().mockResolvedValue(PROFILE)

    const response = await request(createTestApp(ensureProfile, getProfile, updateProfile))
      .put('/api/v1/creator/profile')
      .send({
        bio: PROFILE.bio,
        country: PROFILE.country,
        displayName: PROFILE.displayName,
        niche: PROFILE.niche,
        phoneNumber: PROFILE.phoneNumber,
        phoneVerifiedAt: '2000-01-01T00:00:00.000Z',
      })
      .expect(200)

    expect(response.body).toEqual({ profile: PROFILE })
    expect(updateProfile).toHaveBeenCalledWith(
      PROFILE.userId,
      {
        bio: PROFILE.bio,
        country: PROFILE.country,
        displayName: PROFILE.displayName,
        niche: PROFILE.niche,
        phoneNumber: PROFILE.phoneNumber,
      },
      '2026-11-24T08:00:00.000Z',
    )
  })

  it('allows a creator profile without a phone number', async () => {
    const ensureProfile = vi.fn<(identity: CreatorProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<CreatorProfile>>()
    const updateProfile = vi.fn<(
      userId: string,
      input: UpdateCreatorProfileInput,
      phoneVerifiedAt: string | null,
    ) => Promise<CreatorProfile>>().mockResolvedValue({
      ...PROFILE,
      isPhoneVerified: false,
      phoneNumber: '',
    })

    await request(createTestApp(ensureProfile, getProfile, updateProfile))
      .put('/api/v1/creator/profile')
      .send({
        bio: '',
        country: PROFILE.country,
        displayName: PROFILE.displayName,
        niche: PROFILE.niche,
      })
      .expect(200)

    expect(updateProfile).toHaveBeenCalledWith(
      PROFILE.userId,
      {
        bio: '',
        country: PROFILE.country,
        displayName: PROFILE.displayName,
        niche: PROFILE.niche,
        phoneNumber: '',
      },
      null,
    )
  })

  it('rejects a malformed optional phone number at the API boundary', async () => {
    const response = await request(createTestApp(vi.fn(), vi.fn()))
      .put('/api/v1/creator/profile')
      .send({
        bio: '',
        country: PROFILE.country,
        displayName: PROFILE.displayName,
        niche: PROFILE.niche,
        phoneNumber: '9876543210',
      })
      .expect(400)

    expect(response.body).toEqual({
      error: 'Enter a name, country, niche, and a bio no longer than 500 characters.',
    })
  })

  it('rejects invalid creator details at the API boundary', async () => {
    const response = await request(createTestApp(vi.fn(), vi.fn()))
      .put('/api/v1/creator/profile')
      .send({ bio: '', country: '', displayName: '', niche: '' })
      .expect(400)

    expect(response.body).toEqual({
      error: 'Enter a name, country, niche, and a bio no longer than 500 characters.',
    })
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
