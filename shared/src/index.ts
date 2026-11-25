export interface ApiHealth {
  status: 'ok' | 'error'
  service: string
  timestamp: string
}

export interface CreatorProfile {
  email: string
  firstName: string
  isLinkedInAttached: boolean
  isXAttached: boolean
  lastName: string
  userId: string
}

export interface CreatorProfileResponse {
  profile: CreatorProfile
}

export interface BrandProfile {
  category: string
  companyName: string
  email: string
  isComplete: boolean
  userId: string
  website: string
}

export interface BrandProfileResponse {
  profile: BrandProfile
}

export interface UpdateBrandProfileInput {
  category: string
  companyName: string
  website: string
}

export interface ApiErrorResponse {
  error: string
}

export type SocialPlatform = 'linkedin' | 'x'
export type CampaignStatus = 'closed' | 'draft' | 'open'
export type SubmissionStatus = 'approved' | 'pending' | 'rejected'

export interface Campaign {
  brief: string
  deadline: string
  id: string
  platform: SocialPlatform
  rewardAmount: string
  status: CampaignStatus
  title: string
}

export interface CreateCampaignInput {
  brief: string
  deadline: string
  platform: SocialPlatform
  rewardAmount: string
  title: string
}

export interface CampaignSubmission {
  brandFeedback: string
  campaignId: string
  campaignTitle: string
  id: string
  platform: SocialPlatform
  postUrl: string
  rewardAmount: string
  status: SubmissionStatus
  submittedAt: string
}

export interface CampaignListResponse {
  campaigns: Campaign[]
}

export interface CampaignSubmissionResponse {
  submission: CampaignSubmission
}

export interface CreatorMarketplaceResponse {
  campaigns: Campaign[]
  submissions: CampaignSubmission[]
}

export interface BrandMarketplaceResponse {
  campaigns: Campaign[]
  submissions: CampaignSubmission[]
}

export interface SubmitPostInput {
  postUrl: string
}

export interface ReviewSubmissionInput {
  feedback: string
  status: Extract<SubmissionStatus, 'approved' | 'rejected'>
}

export interface SocialHandle {
  handle: string
  platform: SocialPlatform
  profileUrl: string
}

export interface SocialHandlesResponse {
  handles: SocialHandle[]
}
