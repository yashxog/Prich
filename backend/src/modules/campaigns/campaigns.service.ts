import type {
  BrandMarketplaceResponse,
  Campaign,
  CampaignSubmission,
  CreateCampaignInput,
  CreatorMarketplaceResponse,
  ReviewSubmissionInput,
} from '@prich/shared'
import {
  createCampaignRecord,
  createSubmissionRecord,
  findCampaignRecord,
  listBrandCampaignRecords,
  listBrandSubmissionRecords,
  listCreatorSubmissionRecords,
  listOpenCampaignRecords,
  reviewSubmissionRecord,
  type CampaignRecord,
  type SubmissionWithCampaignRecord,
} from './campaigns.repository.js'

/**
 * Maps a database campaign into its shared API contract.
 * @param record - The database campaign record.
 * @returns The framework-neutral campaign contract.
 */
function mapCampaign(record: CampaignRecord): Campaign {
  return {
    brief: record.brief,
    deadline: record.deadline,
    id: String(record.id),
    platform: record.platform,
    rewardAmount: record.reward_amount,
    status: record.status,
    title: record.title,
  }
}

/**
 * Maps a submission with campaign data into its shared API contract.
 * @param record - The joined database submission record.
 * @returns The framework-neutral submission contract.
 */
function mapSubmission(record: SubmissionWithCampaignRecord): CampaignSubmission {
  return {
    brandFeedback: record.brand_feedback,
    campaignId: String(record.campaign_id),
    campaignTitle: record.campaigns.title,
    id: String(record.id),
    platform: record.campaigns.platform,
    postUrl: record.post_url,
    rewardAmount: record.campaigns.reward_amount,
    status: record.status,
    submittedAt: record.submitted_at,
  }
}

/**
 * Confirms a normalized URL belongs to the campaign's required platform.
 * @param postUrl - The normalized HTTPS post URL.
 * @param platform - The campaign platform stored by Prich.
 * @returns True when the URL is a supported original-post location.
 */
function isPostUrlForPlatform(postUrl: string, platform: 'linkedin' | 'x'): boolean {
  const url = new URL(postUrl)
  const hostname = url.hostname.toLowerCase()

  if (platform === 'x') {
    return (hostname === 'x.com' || hostname === 'www.x.com' || hostname === 'twitter.com' || hostname === 'www.twitter.com')
      && /^\/[^/]+\/status\/\d+/.test(url.pathname)
  }

  return (hostname === 'linkedin.com' || hostname === 'www.linkedin.com')
    && (url.pathname.startsWith('/posts/') || url.pathname.startsWith('/feed/update/'))
}

/**
 * Creates a campaign owned by the authenticated brand.
 * @param brandUserId - The verified brand UUID.
 * @param input - The validated campaign input.
 * @returns The created campaign contract.
 */
export async function createCampaign(
  brandUserId: string,
  input: CreateCampaignInput,
): Promise<Campaign> {
  return mapCampaign(await createCampaignRecord(brandUserId, input))
}

/**
 * Loads open campaigns and the authenticated creator's first-party submission analytics.
 * @param creatorUserId - The verified creator UUID.
 * @returns Marketplace campaigns and the creator's submissions.
 */
export async function getCreatorMarketplace(
  creatorUserId: string,
): Promise<CreatorMarketplaceResponse> {
  const [campaigns, submissions] = await Promise.all([
    listOpenCampaignRecords(),
    listCreatorSubmissionRecords(creatorUserId),
  ])

  return {
    campaigns: campaigns.filter((campaign) => campaign.brand_user_id !== creatorUserId).map(mapCampaign),
    submissions: submissions.map(mapSubmission),
  }
}

/**
 * Submits an original social post for an open campaign.
 * @param creatorUserId - The verified creator UUID.
 * @param campaignId - The campaign identity from the request path.
 * @param postUrl - The validated X or LinkedIn post URL.
 * @returns The stored submission with campaign context.
 */
export async function submitCampaignPost(
  creatorUserId: string,
  campaignId: string,
  postUrl: string,
): Promise<CampaignSubmission> {
  const campaign = await findCampaignRecord(campaignId)

  if (
    campaign.brand_user_id === creatorUserId || campaign.status !== 'open'
    || new Date(campaign.deadline) <= new Date() || !isPostUrlForPlatform(postUrl, campaign.platform)
  ) {
    throw new Error('This campaign is not accepting submissions.')
  }

  const submission = await createSubmissionRecord(campaignId, creatorUserId, postUrl)
  return mapSubmission({ ...submission, campaigns: campaign })
}

/**
 * Loads campaigns and commissioned posts belonging only to one brand.
 * @param brandUserId - The verified brand UUID.
 * @returns The brand's campaigns and submissions.
 */
export async function getBrandMarketplace(brandUserId: string): Promise<BrandMarketplaceResponse> {
  const [campaigns, submissions] = await Promise.all([
    listBrandCampaignRecords(brandUserId),
    listBrandSubmissionRecords(brandUserId),
  ])

  return {
    campaigns: campaigns.map(mapCampaign),
    submissions: submissions.map(mapSubmission),
  }
}

/**
 * Records a brand decision on one of its commissioned posts.
 * @param brandUserId - The verified brand UUID.
 * @param submissionId - The submission identity from the request path.
 * @param input - The validated approval decision and feedback.
 * @returns The reviewed submission contract.
 */
export async function reviewCampaignSubmission(
  brandUserId: string,
  submissionId: string,
  input: ReviewSubmissionInput,
): Promise<CampaignSubmission> {
  return mapSubmission(await reviewSubmissionRecord(
    brandUserId,
    submissionId,
    input.status,
    input.feedback,
  ))
}
