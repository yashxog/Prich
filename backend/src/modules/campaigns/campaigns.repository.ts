import { getBackendClient } from '../../services/supabase_client.js'

export interface CampaignRecord {
  brand_user_id: string
  brief: string
  deadline: string
  id: number
  platform: 'linkedin' | 'x'
  reward_amount: string
  status: 'closed' | 'draft' | 'open'
  title: string
}

export interface CreateCampaignRecordInput {
  brief: string
  deadline: string
  platform: 'linkedin' | 'x'
  rewardAmount: string
  title: string
}

export interface SubmissionRecord {
  brand_feedback: string
  campaign_id: number
  creator_user_id: string
  id: number
  post_url: string
  status: 'approved' | 'pending' | 'rejected'
  submitted_at: string
}

export interface SubmissionWithCampaignRecord extends SubmissionRecord {
  campaigns: Pick<CampaignRecord, 'brand_user_id' | 'platform' | 'reward_amount' | 'title'>
}

/**
 * Creates an open campaign owned by the authenticated brand.
 * @param brandUserId - The brand UUID verified from the access token.
 * @param input - The validated campaign details.
 * @returns The newly stored campaign record.
 */
export async function createCampaignRecord(
  brandUserId: string,
  input: CreateCampaignRecordInput,
): Promise<CampaignRecord> {
  const { data, error } = await getBackendClient()
    .from('campaigns')
    .insert({
      brand_user_id: brandUserId,
      brief: input.brief,
      deadline: input.deadline,
      platform: input.platform,
      reward_amount: input.rewardAmount,
      status: 'open',
      title: input.title,
    })
    .select('id, brand_user_id, title, brief, platform, reward_amount, status, deadline')
    .single<CampaignRecord>()

  if (error || !data) {
    throw new Error('Campaign creation failed.')
  }

  return data
}

/**
 * Lists open campaigns whose submission deadline has not passed.
 * @returns The current marketplace campaign records.
 */
export async function listOpenCampaignRecords(): Promise<CampaignRecord[]> {
  const { data, error } = await getBackendClient()
    .from('campaigns')
    .select('id, brand_user_id, title, brief, platform, reward_amount, status, deadline')
    .eq('status', 'open')
    .gt('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })
    .returns<CampaignRecord[]>()

  if (error) {
    throw new Error('Campaigns could not be loaded.')
  }

  return data ?? []
}

/**
 * Lists campaigns owned by one authenticated brand.
 * @param brandUserId - The brand UUID verified from the access token.
 * @returns The brand's campaign records.
 */
export async function listBrandCampaignRecords(brandUserId: string): Promise<CampaignRecord[]> {
  const { data, error } = await getBackendClient()
    .from('campaigns')
    .select('id, brand_user_id, title, brief, platform, reward_amount, status, deadline')
    .eq('brand_user_id', brandUserId)
    .order('deadline', { ascending: true })
    .returns<CampaignRecord[]>()

  if (error) {
    throw new Error('Brand campaigns could not be loaded.')
  }

  return data ?? []
}

/**
 * Reads one campaign before accepting a creator submission.
 * @param campaignId - The campaign identity from the URL path.
 * @returns The matching campaign record.
 */
export async function findCampaignRecord(campaignId: string): Promise<CampaignRecord> {
  const { data, error } = await getBackendClient()
    .from('campaigns')
    .select('id, brand_user_id, title, brief, platform, reward_amount, status, deadline')
    .eq('id', campaignId)
    .single<CampaignRecord>()

  if (error || !data) {
    throw new Error('Campaign was not found.')
  }

  return data
}

/**
 * Stores a creator's original-post URL for a campaign.
 * @param campaignId - The campaign identity from the URL path.
 * @param creatorUserId - The creator UUID verified from the access token.
 * @param postUrl - The validated public X or LinkedIn post URL.
 * @returns The new submission record.
 */
export async function createSubmissionRecord(
  campaignId: string,
  creatorUserId: string,
  postUrl: string,
): Promise<SubmissionRecord> {
  const { data, error } = await getBackendClient()
    .from('post_submissions')
    .insert({ campaign_id: campaignId, creator_user_id: creatorUserId, post_url: postUrl })
    .select('id, campaign_id, creator_user_id, post_url, status, brand_feedback, submitted_at')
    .single<SubmissionRecord>()

  if (error || !data) {
    throw new Error('Post submission failed.')
  }

  return data
}

/**
 * Lists campaign submissions owned by one creator with campaign context.
 * @param creatorUserId - The creator UUID verified from the access token.
 * @returns The creator's submissions and their campaign data.
 */
export async function listCreatorSubmissionRecords(
  creatorUserId: string,
): Promise<SubmissionWithCampaignRecord[]> {
  const { data, error } = await getBackendClient()
    .from('post_submissions')
    .select('id, campaign_id, creator_user_id, post_url, status, brand_feedback, submitted_at, campaigns!inner(brand_user_id, title, platform, reward_amount)')
    .eq('creator_user_id', creatorUserId)
    .order('submitted_at', { ascending: false })
    .returns<SubmissionWithCampaignRecord[]>()

  if (error) {
    throw new Error('Creator submissions could not be loaded.')
  }

  return data ?? []
}

/**
 * Lists submissions commissioned by one authenticated brand.
 * @param brandUserId - The brand UUID verified from the access token.
 * @returns Submissions belonging only to the brand's campaigns.
 */
export async function listBrandSubmissionRecords(
  brandUserId: string,
): Promise<SubmissionWithCampaignRecord[]> {
  const { data, error } = await getBackendClient()
    .from('post_submissions')
    .select('id, campaign_id, creator_user_id, post_url, status, brand_feedback, submitted_at, campaigns!inner(brand_user_id, title, platform, reward_amount)')
    .eq('campaigns.brand_user_id', brandUserId)
    .order('submitted_at', { ascending: false })
    .returns<SubmissionWithCampaignRecord[]>()

  if (error) {
    throw new Error('Brand submissions could not be loaded.')
  }

  return data ?? []
}

/**
 * Updates a submission only when it belongs to the authenticated brand.
 * @param brandUserId - The brand UUID verified from the access token.
 * @param submissionId - The submission identity from the URL path.
 * @param status - The brand's approval decision.
 * @param feedback - Optional bounded feedback for the creator.
 * @returns The reviewed submission with campaign context.
 */
export async function reviewSubmissionRecord(
  brandUserId: string,
  submissionId: string,
  status: 'approved' | 'rejected',
  feedback: string,
): Promise<SubmissionWithCampaignRecord> {
  const { data: ownedSubmission, error: ownershipError } = await getBackendClient()
    .from('post_submissions')
    .select('id, campaigns!inner(brand_user_id)')
    .eq('id', submissionId)
    .eq('campaigns.brand_user_id', brandUserId)
    .maybeSingle()

  if (ownershipError || !ownedSubmission) {
    throw new Error('Submission was not found for this brand.')
  }

  const { error: updateError } = await getBackendClient()
    .from('post_submissions')
    .update({
      brand_feedback: feedback,
      reviewed_at: new Date().toISOString(),
      status,
    })
    .eq('id', submissionId)

  if (updateError) {
    throw new Error('Submission review failed.')
  }

  const { data, error } = await getBackendClient()
    .from('post_submissions')
    .select('id, campaign_id, creator_user_id, post_url, status, brand_feedback, submitted_at, campaigns!inner(brand_user_id, title, platform, reward_amount)')
    .eq('id', submissionId)
    .single<SubmissionWithCampaignRecord>()

  if (error || !data) {
    throw new Error('Reviewed submission could not be loaded.')
  }

  return data
}
