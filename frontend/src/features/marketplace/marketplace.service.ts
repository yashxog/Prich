import type {
  BrandMarketplaceResponse,
  Campaign,
  CampaignSubmission,
  CreateCampaignInput,
  CreatorMarketplaceResponse,
  ReviewSubmissionInput,
  SocialHandle,
  SocialPlatform,
} from '@prich/shared'
import { apiRequest } from '../../services/api_client'
import { getCurrentAccessToken } from '../auth/auth_session'

/**
 * Loads open campaigns and the current creator's submissions.
 * @returns The creator marketplace response.
 */
export async function getCreatorMarketplace(): Promise<CreatorMarketplaceResponse> {
  return apiRequest<CreatorMarketplaceResponse>(
    '/api/v1/marketplace/creator',
    await getCurrentAccessToken(),
  )
}

/**
 * Sends an original social post URL to a campaign.
 * @param campaignId - The selected campaign ID.
 * @param platform - The campaign's social platform.
 * @param postUrl - The public original-post URL.
 * @returns The new submission contract.
 */
export async function submitCampaignPost(
  campaignId: string,
  platform: SocialPlatform,
  postUrl: string,
): Promise<CampaignSubmission> {
  const response = await apiRequest<{ submission: CampaignSubmission }>(
    `/api/v1/marketplace/creator/${campaignId}/submissions`,
    await getCurrentAccessToken(),
    { body: JSON.stringify({ platform, postUrl }), method: 'POST' },
  )
  return response.submission
}

/**
 * Loads campaigns and submitted posts commissioned by the current brand.
 * @returns The brand marketplace response.
 */
export async function getBrandMarketplace(): Promise<BrandMarketplaceResponse> {
  return apiRequest<BrandMarketplaceResponse>(
    '/api/v1/marketplace/brand',
    await getCurrentAccessToken(),
  )
}

/**
 * Creates a first-party Prich campaign for original posts.
 * @param input - The validated campaign form values.
 * @returns The newly created campaign.
 */
export async function createBrandCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const response = await apiRequest<{ campaign: Campaign }>(
    '/api/v1/marketplace/brand/campaigns',
    await getCurrentAccessToken(),
    { body: JSON.stringify(input), method: 'POST' },
  )
  return response.campaign
}

/**
 * Records the brand's review decision for one commissioned post.
 * @param submissionId - The submission being reviewed.
 * @param input - The approval decision and optional feedback.
 * @returns The updated submission.
 */
export async function reviewBrandSubmission(
  submissionId: string,
  input: ReviewSubmissionInput,
): Promise<CampaignSubmission> {
  const response = await apiRequest<{ submission: CampaignSubmission }>(
    `/api/v1/marketplace/brand/submissions/${submissionId}`,
    await getCurrentAccessToken(),
    { body: JSON.stringify(input), method: 'PUT' },
  )
  return response.submission
}

/**
 * Loads social handles for one profile role under the current identity.
 * @param role - The creator or brand profile namespace.
 * @returns The role-specific social handles.
 */
export async function getSocialHandles(role: 'brand' | 'creator'): Promise<SocialHandle[]> {
  const response = await apiRequest<{ handles: SocialHandle[] }>(
    `/api/v1/social-handles/${role}`,
    await getCurrentAccessToken(),
  )
  return response.handles
}

/**
 * Saves one role-specific X or LinkedIn identity.
 * @param role - The creator or brand profile namespace.
 * @param handle - The validated social identity.
 * @returns The stored social identity.
 */
export async function saveSocialHandle(
  role: 'brand' | 'creator',
  handle: SocialHandle,
): Promise<SocialHandle> {
  const response = await apiRequest<{ handle: SocialHandle }>(
    `/api/v1/social-handles/${role}/${handle.platform}`,
    await getCurrentAccessToken(),
    { body: JSON.stringify(handle), method: 'PUT' },
  )
  return response.handle
}
