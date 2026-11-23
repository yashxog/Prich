import express, { type NextFunction, type Request, type Response } from 'express'
import type { BrandProfile, UpdateBrandProfileInput } from '@prich/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../../../../backend/src/app.js'
import { errorHandler } from '../../../../../backend/src/middleware/error_handler.js'
import type { AuthenticatedLocals } from '../../../../../backend/src/modules/auth/auth.types.js'
import type { BrandProfileIdentity } from '../../../../../backend/src/modules/brand_profile/brand_profile.repository.js'
import { createBrandProfileRouter } from '../../../../../backend/src/modules/brand_profile/brand_profile.routes.js'

const PROFILE: BrandProfile = {
  category: 'SaaS',
  companyName: 'Northstar Labs',
  email: 'team@northstar.example',
  isComplete: true,
  userId: 'f7f0b799-8a34-47a8-b1b7-0283def9dcaa',
  website: 'https://northstar.example/',
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
  response.locals.firstName = ''
  response.locals.lastName = ''
  response.locals.userId = PROFILE.userId
  next()
}

/**
 * Creates a test application with replaceable brand-profile services.
 * @param ensureProfile - The profile creation service double.
 * @param getProfile - The profile retrieval service double.
 * @param updateProfile - The company-details update service double.
 * @returns An Express application exposing brand profile routes.
 */
function createTestApp(
  ensureProfile: (identity: BrandProfileIdentity) => Promise<void>,
  getProfile: (userId: string) => Promise<BrandProfile>,
  updateProfile: (userId: string, input: UpdateBrandProfileInput) => Promise<BrandProfile>,
): express.Express {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/brand/profile', createBrandProfileRouter({
    authenticate: authenticateForTest,
    ensureProfile,
    getProfile,
    updateProfile,
  }))
  app.use(errorHandler)
  return app
}

describe('brand profile routes', () => {
  it('rejects requests without an access token', async () => {
    const response = await request(createApp()).get('/api/v1/brand/profile').expect(401)

    expect(response.body).toEqual({ error: 'Authentication is required.' })
  })

  it('ensures a profile using only trusted identity values', async () => {
    const ensureProfile = vi.fn<(identity: BrandProfileIdentity) => Promise<void>>().mockResolvedValue()
    const getProfile = vi.fn<(userId: string) => Promise<BrandProfile>>()
    const updateProfile = vi.fn<(userId: string, input: UpdateBrandProfileInput) => Promise<BrandProfile>>()

    await request(createTestApp(ensureProfile, getProfile, updateProfile))
      .post('/api/v1/brand/profile/ensure')
      .send({ email: 'attacker@example.com', userId: 'untrusted' })
      .expect(204)

    expect(ensureProfile).toHaveBeenCalledWith({ email: PROFILE.email, userId: PROFILE.userId })
  })

  it('validates and normalizes company details before updating', async () => {
    const ensureProfile = vi.fn<(identity: BrandProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<BrandProfile>>()
    const updateProfile = vi.fn<(userId: string, input: UpdateBrandProfileInput) => Promise<BrandProfile>>()
      .mockResolvedValue(PROFILE)

    const response = await request(createTestApp(ensureProfile, getProfile, updateProfile))
      .put('/api/v1/brand/profile')
      .send({ category: ' SaaS ', companyName: ' Northstar Labs ', website: 'https://northstar.example' })
      .expect(200)

    expect(response.body).toEqual({ profile: PROFILE })
    expect(updateProfile).toHaveBeenCalledWith(PROFILE.userId, {
      category: 'SaaS',
      companyName: 'Northstar Labs',
      website: 'https://northstar.example/',
    })
  })

  it('rejects invalid company websites at the API boundary', async () => {
    const ensureProfile = vi.fn<(identity: BrandProfileIdentity) => Promise<void>>()
    const getProfile = vi.fn<(userId: string) => Promise<BrandProfile>>()
    const updateProfile = vi.fn<(userId: string, input: UpdateBrandProfileInput) => Promise<BrandProfile>>()

    const response = await request(createTestApp(ensureProfile, getProfile, updateProfile))
      .put('/api/v1/brand/profile')
      .send({ category: 'SaaS', companyName: 'Northstar Labs', website: 'javascript:alert(1)' })
      .expect(400)

    expect(response.body).toEqual({
      error: 'Enter a company name, category, and valid HTTP or HTTPS website.',
    })
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
