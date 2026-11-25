import { getBackendClient } from '../../services/supabase_client.js'
import { claimAccountRole } from '../auth/account_role.repository.js'

export interface CreatorProfileIdentity {
  email: string
  firstName: string
  lastName: string
  userId: string
}

export interface CreatorProfileRecord {
  bio: string
  country: string
  display_name: string
  email: string
  first_name: string
  is_linkedin_attached: boolean
  is_x_attached: boolean
  last_name: string
  niche: string
  phone_number: string
  phone_verified_at: string | null
  user_id: string
}

export interface CreatorProfileDetails {
  bio: string
  country: string
  displayName: string
  niche: string
  phoneNumber: string
  phoneVerifiedAt: string | null
}

const CREATOR_PROFILE_COLUMNS = 'user_id, first_name, last_name, display_name, email, phone_number, phone_verified_at, country, niche, bio, is_linkedin_attached, is_x_attached'

/**
 * Ensures the authenticated creator has a private profile row.
 * @param identity - The creator identity verified by backend authentication.
 * @returns Nothing after the database function completes.
 */
export async function ensureCreatorProfileRecord(identity: CreatorProfileIdentity): Promise<void> {
  await claimAccountRole(identity.userId, 'creator')

  const { error } = await getBackendClient()
    .from('creator_profiles')
    .upsert({
      email: identity.email,
      first_name: identity.firstName,
      last_name: identity.lastName,
      user_id: identity.userId,
    }, { onConflict: 'user_id' })

  if (error) {
    throw new Error('Creator profile creation failed.')
  }
}

/**
 * Reads the authenticated creator's private profile under RLS.
 * @param userId - The creator ID verified by backend authentication.
 * @returns The creator profile database record.
 */
export async function findCreatorProfileRecord(userId: string): Promise<CreatorProfileRecord> {
  const { data, error } = await getBackendClient()
    .from('creator_profiles')
    .select(CREATOR_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .single<CreatorProfileRecord>()

  if (error || !data) {
    throw new Error('Creator profile was not found.')
  }

  return data
}

/**
 * Stores validated creator details and the optional phone identity.
 * @param userId - The creator ID verified by backend authentication.
 * @param details - The validated profile and optional phone details.
 * @returns The updated creator profile record.
 */
export async function updateCreatorProfileRecord(
  userId: string,
  details: CreatorProfileDetails,
): Promise<CreatorProfileRecord> {
  const { data, error } = await getBackendClient()
    .from('creator_profiles')
    .update({
      bio: details.bio,
      country: details.country,
      display_name: details.displayName,
      niche: details.niche,
      phone_number: details.phoneNumber,
      phone_verified_at: details.phoneVerifiedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select(CREATOR_PROFILE_COLUMNS)
    .single<CreatorProfileRecord>()

  if (error || !data) {
    throw new Error('Creator profile update failed.')
  }

  return data
}
