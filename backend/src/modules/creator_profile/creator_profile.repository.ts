import { getBackendClient } from '../../services/supabase_client.js'
import { claimAccountRole } from '../auth/account_role.repository.js'

export interface CreatorProfileIdentity {
  email: string
  firstName: string
  lastName: string
  userId: string
}

export interface CreatorProfileRecord {
  email: string
  first_name: string
  is_linkedin_attached: boolean
  is_x_attached: boolean
  last_name: string
  user_id: string
}

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
    .select('user_id, first_name, last_name, email, is_linkedin_attached, is_x_attached')
    .eq('user_id', userId)
    .single<CreatorProfileRecord>()

  if (error || !data) {
    throw new Error('Creator profile was not found.')
  }

  return data
}
