import { getBackendClient } from '../../services/supabase_client.js'
import { claimAccountRole } from '../auth/account_role.repository.js'

export interface BrandProfileIdentity {
  email: string
  userId: string
}

export interface BrandProfileRecord {
  category: string
  company_name: string
  email: string
  user_id: string
  website: string
}

export interface BrandProfileDetails {
  category: string
  companyName: string
  website: string
}

/**
 * Ensures the authenticated brand has a private profile row.
 * @param identity - The brand identity verified by backend authentication.
 * @returns Nothing after the profile is ready.
 */
export async function ensureBrandProfileRecord(identity: BrandProfileIdentity): Promise<void> {
  await claimAccountRole(identity.userId, 'brand')

  const { error } = await getBackendClient()
    .from('brand_profiles')
    .upsert({
      email: identity.email,
      user_id: identity.userId,
    }, { onConflict: 'user_id' })

  if (error) {
    throw new Error('Brand profile creation failed.')
  }
}

/**
 * Reads the authenticated brand's private profile.
 * @param userId - The brand UUID verified by backend authentication.
 * @returns The matching brand profile record.
 */
export async function findBrandProfileRecord(userId: string): Promise<BrandProfileRecord> {
  const { data, error } = await getBackendClient()
    .from('brand_profiles')
    .select('user_id, company_name, email, website, category')
    .eq('user_id', userId)
    .single<BrandProfileRecord>()

  if (error || !data) {
    throw new Error('Brand profile was not found.')
  }

  return data
}

/**
 * Updates the authenticated brand's company details.
 * @param userId - The brand UUID verified by backend authentication.
 * @param details - The validated company details to store.
 * @returns The updated brand profile record.
 */
export async function updateBrandProfileRecord(
  userId: string,
  details: BrandProfileDetails,
): Promise<BrandProfileRecord> {
  const { data, error } = await getBackendClient()
    .from('brand_profiles')
    .update({
      category: details.category,
      company_name: details.companyName,
      updated_at: new Date().toISOString(),
      website: details.website,
    })
    .eq('user_id', userId)
    .select('user_id, company_name, email, website, category')
    .single<BrandProfileRecord>()

  if (error || !data) {
    throw new Error('Brand profile update failed.')
  }

  return data
}
