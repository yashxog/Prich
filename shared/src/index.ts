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
