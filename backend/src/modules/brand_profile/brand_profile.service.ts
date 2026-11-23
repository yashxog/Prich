import type { BrandProfile, UpdateBrandProfileInput } from '@prich/shared'
import {
  ensureBrandProfileRecord,
  findBrandProfileRecord,
  updateBrandProfileRecord,
  type BrandProfileIdentity,
  type BrandProfileRecord,
} from './brand_profile.repository.js'

/**
 * Maps a database brand record into the shared API contract.
 * @param record - The database brand profile record.
 * @returns The framework-neutral brand profile contract.
 */
function mapBrandProfile(record: BrandProfileRecord): BrandProfile {
  return {
    category: record.category,
    companyName: record.company_name,
    email: record.email,
    isComplete: Boolean(record.company_name && record.website && record.category),
    userId: record.user_id,
    website: record.website,
  }
}

/**
 * Creates the caller's brand profile when it does not already exist.
 * @param identity - The brand identity verified by backend authentication.
 * @returns Nothing after the profile is ready.
 */
export async function ensureBrandProfile(identity: BrandProfileIdentity): Promise<void> {
  await ensureBrandProfileRecord(identity)
}

/**
 * Loads the caller's brand profile.
 * @param userId - The brand UUID verified by backend authentication.
 * @returns The normalized brand profile.
 */
export async function getBrandProfile(userId: string): Promise<BrandProfile> {
  return mapBrandProfile(await findBrandProfileRecord(userId))
}

/**
 * Stores validated company details for the caller's brand profile.
 * @param userId - The brand UUID verified by backend authentication.
 * @param input - The validated company profile details.
 * @returns The normalized updated brand profile.
 */
export async function updateBrandProfile(
  userId: string,
  input: UpdateBrandProfileInput,
): Promise<BrandProfile> {
  return mapBrandProfile(await updateBrandProfileRecord(userId, input))
}
