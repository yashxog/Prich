import type { CreatorProfile } from '@prich/shared'
import {
  ensureCreatorProfileRecord,
  findCreatorProfileRecord,
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
    userId: record.user_id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    isLinkedInAttached: record.is_linkedin_attached,
    isXAttached: record.is_x_attached,
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
