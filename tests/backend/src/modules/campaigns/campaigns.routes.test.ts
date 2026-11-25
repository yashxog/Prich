import express, { type NextFunction, type Request, type Response } from 'express'
import type {
  BrandMarketplaceResponse,
  Campaign,
  CampaignSubmission,
  CreateCampaignInput,
  CreatorMarketplaceResponse,
  ReviewSubmissionInput,
} from '@prich/shared'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../../../../backend/src/app.js'
import { errorHandler } from '../../../../../backend/src/middleware/error_handler.js'
import type { AuthenticatedLocals } from '../../../../../backend/src/modules/auth/auth.types.js'
import { createCampaignRouter } from '../../../../../backend/src/modules/campaigns/campaigns.routes.js'

const USER_ID = '7841d8d6-7a6c-42d0-bbd2-aea16431a112'
const CAMPAIGN: Campaign = {
  brief: 'Explain one practical workflow in an original post.',
  deadline: '2027-01-01T00:00:00.000Z',
  id: '42',
  platform: 'x',
  rewardAmount: '125.00',
  status: 'open',
  title: 'Show your workflow',
}
const SUBMISSION: CampaignSubmission = {
  brandFeedback: '',
  campaignId: CAMPAIGN.id,
  campaignTitle: CAMPAIGN.title,
  id: '9',
  platform: CAMPAIGN.platform,
  postUrl: 'https://x.com/creator/status/123456789',
  rewardAmount: CAMPAIGN.rewardAmount,
  status: 'pending',
  submittedAt: '2026-11-25T08:00:00.000Z',
}

/**
 * Supplies a deterministic verified identity to campaign route tests.
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
  response.locals.email = 'owner@example.com'
  response.locals.firstName = 'Owner'
  response.locals.lastName = ''
  response.locals.phoneNumber = ''
  response.locals.phoneVerifiedAt = null
  response.locals.userId = USER_ID
  next()
}

/**
 * Creates an isolated marketplace application with service doubles.
 * @param overrides - Optional service behavior overrides for one test.
 * @returns An Express application exposing marketplace routes.
 */
function createTestApp(overrides: Partial<{
  create: (userId: string, input: CreateCampaignInput) => Promise<Campaign>
  getBrand: (userId: string) => Promise<BrandMarketplaceResponse>
  getCreator: (userId: string) => Promise<CreatorMarketplaceResponse>
  review: (userId: string, submissionId: string, input: ReviewSubmissionInput) => Promise<CampaignSubmission>
  submit: (userId: string, campaignId: string, postUrl: string) => Promise<CampaignSubmission>
}> = {}): express.Express {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/marketplace', createCampaignRouter({
    authenticate: authenticateForTest,
    create: overrides.create ?? vi.fn().mockResolvedValue(CAMPAIGN),
    getBrand: overrides.getBrand ?? vi.fn().mockResolvedValue({ campaigns: [], submissions: [] }),
    getCreator: overrides.getCreator ?? vi.fn().mockResolvedValue({ campaigns: [], submissions: [] }),
    review: overrides.review ?? vi.fn().mockResolvedValue(SUBMISSION),
    submit: overrides.submit ?? vi.fn().mockResolvedValue(SUBMISSION),
  }))
  app.use(errorHandler)
  return app
}

describe('campaign marketplace routes', () => {
  it('requires authentication through the production entry point', async () => {
    await request(createApp()).get('/api/v1/marketplace/creator').expect(401, { error: 'Authentication is required.' })
  })

  it('loads creator data using only the verified identity', async () => {
    const getCreator = vi.fn<(userId: string) => Promise<CreatorMarketplaceResponse>>()
      .mockResolvedValue({ campaigns: [CAMPAIGN], submissions: [] })

    const response = await request(createTestApp({ getCreator }))
      .get('/api/v1/marketplace/creator?userId=attacker')
      .expect(200)

    expect(response.body.campaigns).toEqual([CAMPAIGN])
    expect(getCreator).toHaveBeenCalledWith(USER_ID)
  })

  it('validates and normalizes brand campaign input', async () => {
    const create = vi.fn<(userId: string, input: CreateCampaignInput) => Promise<Campaign>>()
      .mockResolvedValue(CAMPAIGN)

    await request(createTestApp({ create }))
      .post('/api/v1/marketplace/brand/campaigns')
      .send({
        brief: ' Explain one practical workflow in an original post. ',
        deadline: '2027-01-01T00:00:00.000Z',
        platform: 'x',
        rewardAmount: '125.00',
        title: ' Show your workflow ',
      })
      .expect(201)

    expect(create).toHaveBeenCalledWith(USER_ID, {
      brief: CAMPAIGN.brief,
      deadline: CAMPAIGN.deadline,
      platform: CAMPAIGN.platform,
      rewardAmount: CAMPAIGN.rewardAmount,
      title: CAMPAIGN.title,
    })
  })

  it('rejects non-post and cross-platform URLs at the API boundary', async () => {
    const submit = vi.fn<(userId: string, campaignId: string, postUrl: string) => Promise<CampaignSubmission>>()

    await request(createTestApp({ submit }))
      .post('/api/v1/marketplace/creator/42/submissions')
      .send({ platform: 'linkedin', postUrl: 'https://x.com/creator/status/123456789' })
      .expect(400, { error: 'Enter a valid public LinkedIn post URL.' })

    expect(submit).not.toHaveBeenCalled()
  })

  it('scopes brand reviews with the verified brand identity', async () => {
    const review = vi.fn<(
      userId: string,
      submissionId: string,
      input: ReviewSubmissionInput,
    ) => Promise<CampaignSubmission>>().mockResolvedValue({ ...SUBMISSION, status: 'approved' })

    await request(createTestApp({ review }))
      .put('/api/v1/marketplace/brand/submissions/9')
      .send({ feedback: ' Clear and on brief. ', status: 'approved', userId: 'attacker' })
      .expect(200)

    expect(review).toHaveBeenCalledWith(USER_ID, '9', {
      feedback: 'Clear and on brief.',
      status: 'approved',
    })
  })
})
