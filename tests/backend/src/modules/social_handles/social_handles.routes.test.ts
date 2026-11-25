import express, { type NextFunction, type Request, type Response } from 'express'
import type { SocialHandle } from '@prich/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../../../../backend/src/middleware/error_handler.js'
import type { AuthenticatedLocals } from '../../../../../backend/src/modules/auth/auth.types.js'
import { createSocialHandleRouter } from '../../../../../backend/src/modules/social_handles/social_handles.routes.js'

const USER_ID = '7841d8d6-7a6c-42d0-bbd2-aea16431a112'

/**
 * Supplies a deterministic verified identity to social-handle tests.
 * @param _request - The unused request.
 * @param response - The response carrying trusted authentication locals.
 * @param next - The next Express middleware.
 * @returns A resolved promise after forwarding the request.
 */
async function authenticateForTest(
  _request: Request,
  response: Response<unknown, AuthenticatedLocals>,
  next: NextFunction,
): Promise<void> {
  Object.assign(response.locals, {
    email: 'owner@example.com', firstName: '', lastName: '', phoneNumber: '', phoneVerifiedAt: null, userId: USER_ID,
  })
  next()
}

describe('social handle routes', () => {
  it('stores creator and brand handles in distinct role services', async () => {
    const saveCreator = vi.fn<(userId: string, handle: SocialHandle) => Promise<SocialHandle>>()
      .mockImplementation(async (_userId, handle) => handle)
    const saveBrand = vi.fn<(userId: string, handle: SocialHandle) => Promise<SocialHandle>>()
      .mockImplementation(async (_userId, handle) => handle)
    const app = express()
    app.use(express.json())
    app.use('/api/v1/social-handles', createSocialHandleRouter({
      authenticate: authenticateForTest,
      listBrand: vi.fn().mockResolvedValue([]),
      listCreator: vi.fn().mockResolvedValue([]),
      saveBrand,
      saveCreator,
    }))
    app.use(errorHandler)

    await request(app).put('/api/v1/social-handles/creator/x')
      .send({ handle: '@asha', profileUrl: 'https://x.com/asha' }).expect(200)
    await request(app).put('/api/v1/social-handles/brand/linkedin')
      .send({ handle: 'northstar', profileUrl: 'https://www.linkedin.com/company/northstar' }).expect(200)

    expect(saveCreator).toHaveBeenCalledWith(USER_ID, { handle: 'asha', platform: 'x', profileUrl: 'https://x.com/asha' })
    expect(saveBrand).toHaveBeenCalledWith(USER_ID, { handle: 'northstar', platform: 'linkedin', profileUrl: 'https://www.linkedin.com/company/northstar' })
  })
})
