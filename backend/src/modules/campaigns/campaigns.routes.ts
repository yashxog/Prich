import { Router, type NextFunction, type Request, type Response } from 'express'
import type {
  ApiErrorResponse,
  BrandMarketplaceResponse,
  Campaign,
  CampaignSubmissionResponse,
  CreateCampaignInput,
  CreatorMarketplaceResponse,
  ReviewSubmissionInput,
  SocialPlatform,
} from '@prich/shared'
import { authenticateRequest } from '../auth/auth.middleware.js'
import type { AuthenticatedLocals } from '../auth/auth.types.js'
import {
  createCampaign,
  getBrandMarketplace,
  getCreatorMarketplace,
  reviewCampaignSubmission,
  submitCampaignPost,
} from './campaigns.service.js'

interface CampaignRouteDependencies {
  authenticate: typeof authenticateRequest
  create: typeof createCampaign
  getBrand: typeof getBrandMarketplace
  getCreator: typeof getCreatorMarketplace
  review: typeof reviewCampaignSubmission
  submit: typeof submitCampaignPost
}

const DEFAULT_DEPENDENCIES: CampaignRouteDependencies = {
  authenticate: authenticateRequest,
  create: createCampaign,
  getBrand: getBrandMarketplace,
  getCreator: getCreatorMarketplace,
  review: reviewCampaignSubmission,
  submit: submitCampaignPost,
}

/**
 * Validates and normalizes an untrusted campaign creation body.
 * @param value - The JSON request body.
 * @returns A safe campaign input, or null when invalid.
 */
function parseCampaignInput(value: unknown): CreateCampaignInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const body = value as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''
  const platform = body.platform === 'x' || body.platform === 'linkedin' ? body.platform : null
  const rewardAmount = typeof body.rewardAmount === 'string' ? body.rewardAmount.trim() : ''
  const deadline = typeof body.deadline === 'string' ? body.deadline : ''
  const parsedDeadline = new Date(deadline)

  if (
    !title || title.length > 160 || !brief || brief.length > 2000 || !platform
    || !/^\d{1,10}(?:\.\d{1,2})?$/.test(rewardAmount)
    || Number(rewardAmount) <= 0 || Number.isNaN(parsedDeadline.getTime())
    || parsedDeadline <= new Date()
  ) {
    return null
  }

  return {
    brief,
    deadline: parsedDeadline.toISOString(),
    platform,
    rewardAmount,
    title,
  }
}

/**
 * Validates an original post URL against the campaign platform.
 * @param value - The untrusted post URL value.
 * @param platform - The campaign's required social platform.
 * @returns The normalized public URL, or null when invalid.
 */
function parsePostUrl(value: unknown, platform: SocialPlatform): string | null {
  if (typeof value !== 'string' || value.length > 2048) {
    return null
  }

  try {
    const url = new URL(value.trim())
    const hostname = url.hostname.toLowerCase()
    const isXPost = (hostname === 'x.com' || hostname === 'www.x.com' || hostname === 'twitter.com' || hostname === 'www.twitter.com')
      && /^\/[^/]+\/status\/\d+/.test(url.pathname)
    const isLinkedInPost = (hostname === 'linkedin.com' || hostname === 'www.linkedin.com')
      && (url.pathname.startsWith('/posts/') || url.pathname.startsWith('/feed/update/'))

    if (url.protocol !== 'https:' || (platform === 'x' ? !isXPost : !isLinkedInPost)) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

/**
 * Validates a brand review body.
 * @param value - The untrusted JSON request body.
 * @returns A safe review input, or null when invalid.
 */
function parseReviewInput(value: unknown): ReviewSubmissionInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const body = value as Record<string, unknown>
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : ''

  if ((body.status !== 'approved' && body.status !== 'rejected') || feedback.length > 1000) {
    return null
  }

  return { feedback, status: body.status }
}

/**
 * Creates the authenticated campaign marketplace router.
 * @param dependencies - Replaceable authentication and service dependencies.
 * @returns An Express router for creator submission and brand review workflows.
 */
export function createCampaignRouter(
  dependencies: CampaignRouteDependencies = DEFAULT_DEPENDENCIES,
): Router {
  const router = Router()

  router.use(dependencies.authenticate)

  router.get('/creator', async (
    _request: Request,
    response: Response<CreatorMarketplaceResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(await dependencies.getCreator(response.locals.userId))
    } catch (error) {
      next(error)
    }
  })

  router.post('/creator/:campaignId/submissions', async (
    request: Request<{ campaignId: string }>,
    response: Response<CampaignSubmissionResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> => {
    const campaignPlatform = request.body?.platform

    if (campaignPlatform !== 'x' && campaignPlatform !== 'linkedin') {
      response.status(400).json({ error: 'Choose X or LinkedIn for this post.' })
      return
    }

    const postUrl = parsePostUrl(request.body?.postUrl, campaignPlatform)

    if (!postUrl) {
      response.status(400).json({ error: `Enter a valid public ${campaignPlatform === 'x' ? 'X' : 'LinkedIn'} post URL.` })
      return
    }

    try {
      response.status(201).json({
        submission: await dependencies.submit(
          response.locals.userId,
          request.params.campaignId,
          postUrl,
        ),
      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/brand', async (
    _request: Request,
    response: Response<BrandMarketplaceResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(await dependencies.getBrand(response.locals.userId))
    } catch (error) {
      next(error)
    }
  })

  router.post('/brand/campaigns', async (
    request: Request,
    response: Response<{ campaign: Campaign } | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> => {
    const input = parseCampaignInput(request.body)

    if (!input) {
      response.status(400).json({ error: 'Enter a title, brief, platform, positive reward, and future deadline.' })
      return
    }

    try {
      response.status(201).json({ campaign: await dependencies.create(response.locals.userId, input) })
    } catch (error) {
      next(error)
    }
  })

  router.put('/brand/submissions/:submissionId', async (
    request: Request<{ submissionId: string }>,
    response: Response<CampaignSubmissionResponse | ApiErrorResponse, AuthenticatedLocals>,
    next: NextFunction,
  ): Promise<void> => {
    const input = parseReviewInput(request.body)

    if (!input) {
      response.status(400).json({ error: 'Choose approve or reject and keep feedback under 1,000 characters.' })
      return
    }

    try {
      response.json({
        submission: await dependencies.review(
          response.locals.userId,
          request.params.submissionId,
          input,
        ),
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
