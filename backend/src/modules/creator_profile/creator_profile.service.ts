import type { CreatorProfile, UpdateCreatorProfileInput } from '@prich/shared'
import {
  ensureCreatorProfileRecord,
  findCreatorProfileRecord,
  updateCreatorProfileRecord,
  type CreatorProfileIdentity,
  type CreatorProfileRecord,
} from './creator_profile.repository.js'

/**
 * Creates the caller's creator profile when it does not already exist.
 * @param identity - The creator identity verified by backend authentication.
 * @returns Nothing after the profile is ready.
 */
export async function ensureCreatorProfile(identity: CreatorProfileIdentity): Promise<void> {
  await ensureCreatorProfileRecord(identity)
}

/**
 * Maps a database creator record into the shared API contract.
 * @param record - The database creator profile record.
 * @returns The framework-neutral creator profile contract.
 */
function mapCreatorProfile(record: CreatorProfileRecord): CreatorProfile {
  return {
    bio: record.bio,
    country: record.country,
    displayName: record.display_name,
    userId: record.user_id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    isComplete: Boolean(
      record.display_name
      && record.country
      && record.niche
    ),
    isLinkedInAttached: record.is_linkedin_attached,
    isXAttached: record.is_x_attached,
    isPhoneVerified: Boolean(record.phone_number && record.phone_verified_at),
    niche: record.niche,
    phoneNumber: record.phone_number,
  }
}

/**
 * Loads the caller's creator profile.
 * @param userId - The creator ID verified by backend authentication.
 * @returns The normalized creator profile.
 */
export async function getCreatorProfile(userId: string): Promise<CreatorProfile> {
  return mapCreatorProfile(await findCreatorProfileRecord(userId))
}

/**
 * Stores creator onboarding details with an optional phone number.
 * @param userId - The creator ID verified by backend authentication.
 * @param input - The validated creator profile values.
 * @param phoneVerifiedAt - The trusted confirmation timestamp when the submitted phone matches Supabase Auth.
 * @returns The normalized updated creator profile.
 */
export async function updateCreatorProfile(
  userId: string,
  input: UpdateCreatorProfileInput,
  phoneVerifiedAt: string | null,
): Promise<CreatorProfile> {
  return mapCreatorProfile(await updateCreatorProfileRecord(userId, {
    ...input,
    phoneNumber: input.phoneNumber ?? '',
    phoneVerifiedAt,
  }))
}
